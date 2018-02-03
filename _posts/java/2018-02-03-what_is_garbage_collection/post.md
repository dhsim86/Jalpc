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

<br>
# Garbage Collection in Java

## Fragmenting and Compacting

메모리를 정리하는 작업인 Sweep 단계에서 JVM은 닿을 수 없는 객체들을 정리하여 그 객체들이 사용하던 메모리를 회수해야 한다. 그런데 이 메모리를 정리하는 단계에서 메모리 단편화(Memory Fragmentation)가 필연적으로 발생하게 되며 다음과 같은 문제를 일으킨다.

* Write operation과 같은 작업들은 사용하기에 적절한 **다음 메모리 블록**을 찾기 위해 시간을 더 소모하게 된다.
* 보통 객체를 새로 생성할 때는 그 객체들이 점유할 메모리 공간은 반드시 연속적이어야 한다. 따라서 메모리 단편화가 발생하면, 전체 free 메모리 공간은 여유로운데도 불구하고 객체 생성에 실패할 수가 있다.

이 문제를 피하기 위해 JVM은 메모리 단편화를 없애기 위해 추가적인 작업을 수행한다. 이 작업이 바로 **Compaction** 이며 닿을 수 있는 객체, 즉 현재 사용 중인 객체들을 한 곳으로 모으는 일이다.

<br>
![03.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/03.png)

<br>
## Generational Hypothesis

앞서 설명했지만, Garbage Collection이 발생하면 현재 running하고 있던 애플리케이션 스레드를 멈춘다. 이 멈추게 되는 시간을 줄이기 위한 방법으로 많은 연구가 진행되었다.

David ungar 라는 사람이 1984년에 ['Generation Scavenging: A Non-disruptive High Performance Storage Reclamation Algorithm'](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.122.4295) 라는 논문을 발표했는데, 여기서 가설을 하나 제시하면서 **Generational GC** 를 소개한다.

* 대부분의 객체들은 보통 사용하고 **바로 버려진다.**

<br>
![04.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/04.png)

실졔 통계로도 생성된 객체의 98%는 곧바로 사용되지 않고 바로 버려진다고 한다. 이 가설을 베이스로 JVM에서 관리하는 메모리 영역은 크게 **Young 영역 및 Old 영역으로 나누었다.**

메모리 공간을 이 두개의 영역으로 나눈뒤 **새로 생성하는 객체들은 Young 영역에서만 할당하고, 상대적으로 오래 살아남는 객체들은 Old 영역으로 보낸다. 그리고 Young 영역 위주로 청소해주는 것이 기본 아이디어이다.** 따라서 GC가 일어날 때마다 전체 메모리 공간을 다 살펴볼 필요없이 Young 영역 위주로 청소하면 되므로 STW 시간이 줄어들게 된다.

> 자주 GC가 일어나게 되겠지만 STW로 길게 한 번 멈추는 것보다는 짧게 여러 번 멈추는 것이 더 이익이다.

그리고 JVM은 Young 영역을 청소할 때, 한 번에 다 비우기 때문에 GC 일어난 후에 Young 영역은 연속된 여유공간이 만들어지게 되므로 메모리 단편화를 완화시킬 수 있다.

> 이렇게 두 개의 영역을 나눔으로써 한 가지 문제가 발생하게 되는데, **어떤 객체가 서로 다른 영역의 객체를 바라보고 있다면 어떻게 할 것인가에 대한 문제가 발생한다.** 가령 Old 영역에 있는 객체가 Young 영역의 객체를 참조하고 있을 경우를 고려해야 되기 때문이다.

<br>
## Memory Pools

다음 그림은 JVM에서 관리하는 메모리 영역을 나타낸 것이다. GC 알고리즘마다 세부 동작은 다르긴 하지만 메모리 공간의 영역을 공통적으로 이렇게 나누고 동작한다.

<br>
![05.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/05.png)

<br>
### Eden

Eden 영역에서는 보통 객체가 새로 생성될 때 할당받는 공간이다. 애플리케이션 스레드는 보통 여러 개이므로, 당연히 객체 생성도 동시에 발생할 수 있다. 따라서 보통 Eden 영역도 **Thread Local Allocation Buffer (TLAB)** 라는 여러 영역으로 나뉜다. 이를 통해 동기화가 필요없이 각 애플리케이션 스레드들은 자신이 필요한 공간을 할당받을 수 있다.

만약 스레드들이 자신의 TLAB로부터 메모리 공간을 할당받지 못하면, 메모리 할당은 스레드들에게 공유되는 Eden 영역에서 일어나게 된다. 만약 이 영역에서도 새로 할당할 충분한 여유 공간이 없다면, Eden 영역을 포함하는 Young 영역에서 GC가 발생하게 된다. 그런데 GC가 발생했는데도 충분한 메모리를 확보하지 못한다면 Old 영역에 대해서도 GC를 수행하게 될 것이다.

Eden 영역에서 GC가 수행될 때, 앞서 언급했듯이 **GC ROOTS라 불리는 객체로부터 시작하여 닿을 수 있는 객체들을 식별하여 Mark하게 된다.**

앞서 언급한, 특정 객체가 서로 다른 영역의 객체를 참조하고 있을 때의 문제가 여기서 발생한다. 
기껏 전체 메모리 공간을 Young 영역과 Old 영역으로 나누어 Young 영역에 대해서만 청소를 함으로써 GC에 걸리는 시간을 줄여보려고 했더니, Old 영역도 검사를 해야 되기 때문이다. 

JVM은 **card-marking** 를 통해 해결한다. 여기서는 Old 영역에 있는 객체가 Young 영역의 객체를 참조하고 있을 경우 Mark 해두었다가 GC 대상인지 식별하는 것이다.

[The JVM Write Barrier - Card Marking](http://psy-lob-saw.blogspot.kr/2014/10/the-jvm-write-barrier-card-marking.html)<br>

<br>
![06.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/06.png)

GC 대상인지를 식별하는 Mark 단계가 끝나면, **Eden 영역의 살아있는 모든 객체들은 두 개의 Survivor 영역 중 하나의 영역으로 이동하며 Eden 영역은 완전히 비워지게 된다.** 이를 **"Mark and Copy"** 라고 부른다.

<br>
### Survivor spaces

<br>
### Old Generation

<br>
### PermGen

<br>
### Metaspace

<br>
# Minor GC vs Major GC vs Full GC

<br>
## Minor GC

<br>
## Major GC vs Full GC

