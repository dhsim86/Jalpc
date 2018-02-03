---
layout: post
title:  "Garbage Collection 기본 개념"
date:   2018-02-03
desc: "Garbage Collection 기본 개념"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# Garbage Collection Background 개념

자바에서 garbage collection 은 어떤 오브젝트를 계속 사용할 수 있을지, 아니면 버려야할지를 추적하고 각 알고리즘별로 필요한 일을 하는 것이다. 

먼저 JVM에 구현된, 자동 메모리 청소기인 **Garbage Collection** 에 대해 알아보기 위해 몇가지 개념을 알아두어야 한다.

<br>
## Manual Memory Management

먼저 Garbage Collection 을 설명하기 전에 앞서 자동으로 메모리를 청소하지 않는, 즉 C나 C++ 언어에서는 메모리 관리를 개발자 입장에서 수동으로 해주어야 한다. (스마트 포인터 같은 것은 생각하지 말고)

C언어나 C++언어에서 다음과 같이 사용한 메모리를 해제해주지 않으면 바로 메모리 누수가 발생한다.

```c
int send_request() {
    size_t n = read_size();
    int *elements = malloc(n * sizeof(int));

    if(read_elements(n, elements) < n) {
        return -1;
    }

    // …

    free(elements)
    return 0;
}
```

C나 C++언어를 개발해본 사람들은 메모리를 해제해주지 않을 때가 종종 있었을 것이다. 메모리 누수가 발생한다는 것은 추후에 어떠한 문제를 반드시 일으키게 되며, 이런 개발자들을 위해(?) 더 이상 사용하지 않는 메모리에 대해서는 자동으로 해제하자는 것이 **Garbage Collection** 인 것이다.

<br>
### Smart Pointers

C++ 에서는 객체가 소멸될 때 자동으로 호출되는 소멸자 함수를 통해 메모리를 자동으로 해제하는 방법으로 스마트 포인터가 있다. 

```c++
template <class T> class auto_ptr
{
    T* ptr;

public:
    explicit auto_ptr(T* p = 0) : ptr(p) {
      
    }

    ~auto_ptr() {
      delete ptr; // 자동으로 호출되는 소멸자 함수를 통해, 실제 객체를 delete 시킬 수 있다.
    }

    T& operator*() {
      return *ptr;
    }
    T* operator->() {
      return ptr;
    }
    // ...
};

void foo()
{
    auto_ptr<MyClass> p(new MyClass);
    p->DoSomething();
}
```

[C++ shared_ptr](http://en.cppreference.com/w/cpp/memory/shared_ptr)<br>
[C++ weak_ptr](http://en.cppreference.com/w/cpp/memory/weak_ptr)<br>
[C++ unique_ptr](http://en.cppreference.com/w/cpp/memory/unique_ptr)

<br>
## Automated Memory Management

C, C++언어에서처럼 시스템적으로 자동으로 메모리 관리를 해줄 수 있다면 개발자 입장에서는 더 이상 메모리에 대해서는 신경을 쓰지 않을 수 있을 것이다.

시스템이 어느 메모리 영역(Garbage)이 더 이상 쓰이지 않고 재사용할 수 있을지 추적하고, 그리고 회수한 메모리를 다시 할당해준다는 것은 다른 말로 쓰레기 수집(Garbage Collection)이라 부를 수 있을 것 같다.

<br>
### Reference Counting

C++ 에서 shared_ptr 이라는 스마트 포인터에는 레퍼런스 카운트라는 개념이 있다. 이 스마트 포인터는 내부적으로 레퍼런스 카운트를 유지하고 있다가, 이 값이 0이되면 그 때 해당 객체의 메모리를 해제하는 것이다. 또한 자바 뿐만 아니라, Perl이나 Python, PHP와 같은 언어들도 레퍼런스 카운트라는 개념이 있다.

즉 레퍼런스 카운트가 0이 된 객체들의 메모리는 더 이상 쓰이지 않는다고 봐도 좋으며, Garbage Collection의 대상이 되는 것이다.

<br>
![00.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/00.png)

그림에서 각 vertex는 객체를 의미하며, 쓰여진 번호는 현재 객체의 **레퍼런스 카운트**를 의미한다. 그래프를 보면 알 수 있겠지만 각 vertex의 진입 차수이다.

초록색 구름 (GC ROOTS)로부터 시작하는 **푸른색 방향 그래프의 각 vertex들은 현재 사용 중인 객체를 의미한다.** 이 객체들은 지역 변수일 수도 있고, 스태틱 변수나 힙에 할당한 변수일 수도 있다. 

그리고 위의 그림에서 **회색으로 표시된 방향 그래프의 각 vertex들은 현재 사용 중이지 않는 객체들이다.** 이들 객체들은 Garbage Collection의 대상 객체이다.

또한 다음과 같이 **사이클이 생긴 붉은색 방향 그래프의 객체들도 Garbage Collection의 대상이다.**

<br>
![01.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/01.png)

<br>
### Mark and Sweep

JVM에서는 위의 그래프에서 보여준대로, 개념적으로 GC ROOT로부터 시작하여 닿을 수 있는(reachable) 객체들을 식별하고, 닿지 않는 객체들은 정리하여 그 객체들이 사용하던 메모리를 다시 사용할 수 있도록 한다. 

GC ROOT라 부를 수 있는 객체들은 다음과 같다.

* Local Variable (지역 변수)
* Active Threads (현재 활성화된 스레드)
* Static fields (정적 변수)
* JNI Reference

JVM에는 이들 객체로부터 시작해서 참조되고 있는 모든 객체들을 식별하고, 닿지 않는 객체들의 메모리를 정리하는데 이를 **Mark and Sweep** 알고리즘이라 부른다.

* Mark: GC ROOT 부터 시작하여 닿을 수 있는 모든 객체들을 식별하며, 그것을 기록해둔다.
* Sweep: Mark 단계에서 식별되지 못한, 즉 닿을 수 없는 객체들의 메모리를 해제하여 재사용할 수 있도록 한다.

JVM에서 구현된 Garbage Collection 알고리즘(Parall GC나 CMS, G1)마다 세부 동작은 다르지만 **개념적으로는 위의 Mark and Sweep 알고리즘을 따른다.**

<br>
![02.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/02.png)

위 그림과 같이 사이클이 생긴 그래프의 객체 포함, GC ROOTS 로부터 닿지 않는 객체들은 모두 메모리 정리 대상이다.


<br>
### Stop The World

Garbage Collection이 일어나면 돌고 있던 애플리케이션 스레드들은 잠시 하던 일을 멈추어야 한다. 이를 STW(Stop-The-World) 라 부르며, JVM에서는 여러가지 이유로 발생하지만 보통 GC 때문에 발생한다.