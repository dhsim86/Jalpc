---
layout: post
title:  "Garbage Collection 기본 개념"
date:   2018-02-04
desc: "Garbage Collection 기본 개념"
keywords: "java, garbage collection, gc, cms, g1, 가비지 컬렉션"
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

즉, 레퍼런스 카운트가 0이 된 객체들의 메모리는 더 이상 쓰이지 않는다고 봐도 좋으며 Garbage Collection의 대상이 되는 것이다.

<br>
![00.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/00.png)

그림에서 각 vertex는 객체를 의미하며, 쓰여진 번호는 현재 객체의 **레퍼런스 카운트**를 의미한다. 그래프를 보면 알 수 있겠지만 각 vertex의 진입 차수이다.

초록색 구름(GC Root)으로부터 시작하는 **푸른색 방향 그래프의 각 vertex들은 현재 사용 중인 객체를 의미한다.** 이 객체들은 지역 변수일 수도 있고, 스태틱 변수나 힙에 할당한 변수일 수도 있다. 

그리고 위의 그림에서 **회색으로 표시된 방향 그래프의 각 vertex들은 현재 사용 중이지 않는 객체들이다.** 이들 객체들은 Garbage Collection의 대상 객체이다.

또한 다음과 같이 **사이클이 생긴 붉은색 방향 그래프의 객체들도 Garbage Collection의 대상이다.**

<br>
![01.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/01.png)

<br>
### Mark and Sweep

JVM에서는 위의 그래프에서 보여준대로, 개념적으로 GC Root로부터 시작하여 **닿을 수 있는(reachable) 객체들을 식별하고, 닿지 않는 객체들은 정리하여 그 객체들이 사용하던 메모리를 다시 사용할 수 있도록 한다.**

GC Root라 부를 수 있는 객체들은 다음과 같다.

* Class Loader에 의해 로딩된 클래스
* Local Variable / Parameters (지역 변수 / 매개 변수)
* Active Threads (현재 활성화된 스레드)
* Static fields (정적 변수)
* JNI Reference
  * JNI 메소드의 지역 변수 / 매개 변수
  * 전역 JNI 참조 변수
* Monitor로 사용된 객체

> 자바에서 객체는 GC Root로부터 참조되면 GC 대상이 아니다. 더 이상 GC Root로부터 연결고리가 없어지면 GC 대상이 되어 GC 수행시 메모리에서 해제되어 공간을 반납한다. 메모리 누수는 더 이상 사용되지 않는 객체가 계속해서 GC Root로부터 연결되어 참조가 남아서 GC 대상이 되지 않고 유지되어 발생한다.

JVM에는 이들 객체로부터 시작해서 참조되고 있는 모든 객체들을 식별하고, 닿지 않는 객체들의 메모리를 정리하는데 이를 **Mark and Sweep** 알고리즘이라 부른다.

* Mark: GC Root 부터 시작하여 닿을 수 있는 모든 객체들을 식별하며, 그것을 기록해둔다.
* Sweep: Mark 단계에서 식별되지 못한, 즉 닿을 수 없는 객체들의 메모리를 해제하여 재사용할 수 있도록 한다.

JVM에서 구현된 Garbage Collection 알고리즘 (Parall GC나 CMS, G1)마다 세부 동작은 다르지만 **개념적으로는 위의 Mark and Sweep 알고리즘을 따른다.**

<br>
![02.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/02.png)

위 그림과 같이 사이클이 생긴 그래프의 객체 포함, GC Root 로부터 닿지 않는 객체들은 모두 메모리 정리 대상이다.


<br>
### Stop The World

Garbage Collection이 일어나면 돌고 있던 애플리케이션 스레드들은 잠시 하던 일을 멈추어야 한다. 이를 STW(Stop-The-World) 라 부르며, JVM에서는 여러가지 이유로 발생하지만 보통 GC 때문에 발생한다.

<br>
# Garbage Collection in Java

<br>
## Java Heap

자바 힙 영역은 Garbage Collection과 연관이 깊은 곳인데, 모든 Thread들에 의해 공유되는 영역이다. 힙 영역은 단지 인스턴스들과 Array 객체, 두 가지 종류가 저장되는 공간으로 이 영역에서의 메모리 해제는 오직 Garbage Collection에 의해서만 수행된다. JVM 스펙은 이러한 원칙을 강하게 제시하고 있고, 어떻게 구현할지는 JVM 벤더들에게 일임하고 있다.

<br>
## Fragmenting and Compacting

메모리를 정리하는 작업인 Sweep 단계에서 JVM은 닿을 수 없는 객체들을 정리하여 그 객체들이 사용하던 메모리를 회수해야 한다. 그런데 이 메모리를 정리하는 단계에서 메모리 단편화(Memory Fragmentation)가 필연적으로 발생하게 되며 다음과 같은 문제를 일으킨다.

* Write operation과 같은 작업들은 사용하기에 적절한 **다음 메모리 블록**을 찾기 위해 시간을 더 소모하게 된다.
* 보통 객체를 새로 생성할 때는 그 객체들이 점유할 메모리 공간은 **반드시 연속적이어야 한다.** 따라서 메모리 단편화가 발생하면, 전체 free 메모리 공간은 여유로운데도 불구하고 객체 생성에 실패할 수가 있다.

이 문제를 피하기 위해 JVM은 메모리 단편화를 없애는 추가적인 작업을 수행한다. 이 작업이 바로 **Compaction** 이며 닿을 수 있는 객체, 즉 현재 사용 중인 객체들을 한 곳으로 모으는 일이다.

<br>
![03.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/03.png)

<br>
## Generational Hypothesis

앞서 설명했지만, Garbage Collection이 발생하면 현재 running하고 있던 애플리케이션 스레드를 멈춘다. 이 멈추게 되는 시간을 줄이기 위한 방법으로 많은 연구가 진행되었다.

David ungar 라는 사람이 1984년에 ['Generation Scavenging: A Non-disruptive High Performance Storage Reclamation Algorithm'](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.122.4295) 라는 논문을 발표했는데, 여기서 가설을 하나 제시하면서 **Generational GC** 를 소개한다.

> 대부분의 객체들은 보통 사용하고 **바로 버려진다.**

<br>
![04.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/04.png)

실졔 통계로도 생성된 객체의 98%는 곧바로 사용되지 않고 바로 버려진다고 한다. 이 가설을 베이스로 JVM에서 관리하는 메모리 영역은 크게 **Young 영역 및 Old 영역으로 나누었다.**

메모리 공간을 이 두개의 영역으로 나눈뒤 **새로 생성하는 객체들은 Young 영역에서만 할당하고, 상대적으로 오래 살아남는 객체들은 Old 영역으로 보낸다. 그리고 Young 영역 위주로 청소해주는 것이 기본 아이디어이다.** 따라서 GC가 일어날 때마다 전체 메모리 공간을 다 살펴볼 필요없이 Young 영역 위주로 청소하면 되므로 Stop-The-World 시간이 줄어들게 된다.

> 즉, 새로 할당되는 객체가 모이는 곳은 단편화 발생 확률이 높다고 간주된다. Compaction을 피하기 위해 객체 할당을 위한 Eden 영역과 GC 당시 살아 있는 객체들을 피신시키는 Survivor 영역을 따로 구성한 것이다.

> 자주 GC가 일어나게 되겠지만 Stop-The-World로 길게 한 번 멈추는 것보다는 짧게 여러 번 멈추는 것이 더 이익이다.

그리고 JVM은 Young 영역을 청소할 때, 한 번에 다 비우기 때문에 GC 일어난 후에 Young 영역은 연속된 여유공간이 만들어지게 되므로 메모리 단편화를 완화시킬 수 있다.

> 이렇게 두 개의 영역을 나눔으로써 한 가지 문제가 발생하게 되는데, **어떤 객체가 서로 다른 영역의 객체를 바라보고 있다면 어떻게 할 것인가에 대한 문제가 발생한다.** 가령 Old 영역에 있는 객체가 Young 영역의 객체를 참조하고 있을 경우를 고려해야 되기 때문이다.

<br>
## Memory Pools

다음 그림은 JVM에서 관리하는 메모리 영역을 나타낸 것이다. GC 알고리즘마다 세부 동작은 다르긴 하지만 메모리 공간의 영역을 공통적으로 이렇게 나누고 동작한다.

다음 그림과 같이 Young 영역은 Eden과 두 개의 Survivor 영역으로 이루어져 있다.

<br>
![05.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/05.png)

<br>
### Eden

Eden 영역에서는 보통 객체가 새로 생성될 때 할당받는 공간이다. 애플리케이션 스레드는 보통 여러 개이므로, 당연히 객체 생성도 동시에 발생할 수 있다. 따라서 보통 Eden 영역도 **Thread Local Allocation Buffer (TLAB)** 라는 여러 영역으로 나뉜다. 이를 통해 동기화가 필요없이 각 애플리케이션 스레드들은 자신이 필요한 공간을 할당받을 수 있다.

---

#### TLAB

TLAB는 Heap의 Young 영역 중 Eden 영역에 여러 스레드가 동시에 메모리 할당시, 스레드 간의 경합에 의한 성능 감소 문제 해결을 위해 각각 스레드 별로 메모리 영역을 개별로 할당하여 성능 향상을 도모하는 메모리 할당 방식이다. 각 스레드마다 할당 주소 범위를 부여하여 이 영역을 로컬 할당 버퍼로써 사용하는데, 스레드가 다른 스레드에 영향을 주지 않고 동기화가 필요없이 빠른 메모리 할당이 가능해진다.

> TLAB 영역을 새로 할당받거나 할당된 TLAB가 부족하여 새로이 할당을 받을 때는 동기화 이슈가 발생하지만 객체 할당 횟수에 비해서는 동기화 이슈가 대폭 줄어든다.

TLAB에 할당할 때는 빠르게 수행되지만 TLAB에 충분한 크기의 여유 공간이 없을 경우 TLAB 바깥 영역에 객체 할당을 시도하는데, 이 때 스레드 간의 경합이 발생하여 성능이 떨어지게 된다.이를 위해 JVM에서는 TLAB를 위한 옵션을 제공한다.

---

만약 스레드들이 자신의 TLAB로부터 메모리 공간을 할당받지 못하면, 메모리 할당은 스레드들에게 공유되는 Eden 영역 (TLAB 바깥)에서 일어나게 된다. 만약 이 영역에서도 새로 할당할 충분한 여유 공간이 없다면, Eden 영역을 포함하는 Young 영역에서 GC가 발생하게 된다. 그런데 GC가 발생했는데도 충분한 메모리를 확보하지 못한다면 Old 영역에 대해서도 GC를 수행하게 될 것이다.

Eden 영역에서 GC가 수행될 때, 앞서 언급했듯이 **GC Root라 불리는 객체로부터 시작하여 닿을 수 있는 객체들을 식별하여 Mark하게 된다.**

앞서 언급한, 특정 객체가 서로 다른 영역의 객체를 참조하고 있을 때의 문제가 여기서 발생한다. 
기껏 전체 메모리 공간을 Young 영역과 Old 영역으로 나누어 Young 영역에 대해서만 청소를 함으로써 GC에 걸리는 시간을 줄여보려고 했더니, Old 영역도 검사를 해야 되기 때문이다. 

JVM은 **Card Table을 활용한 Card Marking** 를 통해 해결한다. 여기서는 Old 영역에 있는 객체가 Young 영역의 객체를 참조하고 있을 경우 Mark 해두었다가 GC 대상인지 식별하는 것이다.

---

#### Card Table

Card Table이란 Old 영역의 메모리를 대표하는 별도의 자료구조이다. 만약 Young 영역의 객체를 참조하는 객체가 Old 영역에 있다면, 이 Old 영역의 객체의 시작주소에 카드(일종의 Flag)를 Dirty로 표시하고 해당 내용을 Card Table에 기록한다. 이후 더 이상 참조하지 않게 되면 Dirty Card도 사라지게 하여 객체 간의 참조 관계를 쉽게 파악할 수 있다.

JVM은 Minor GC 수행시 이 Card Table의 Dirty Card만 검색한다면 Old 영역으로부터 참조되는 Young 영역의 살아 있는 객체를 식별할 수 있으므로, Old 영역을 다 검사하지 않고도 빠르게 Mark 단계를 끝낼 수 있다.

[The JVM Write Barrier - Card Marking](http://psy-lob-saw.blogspot.com/2014/10/the-jvm-write-barrier-card-marking.html)<br>

---


<br>
![06.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/06.png)

GC 대상인지를 식별하는 Mark 단계가 끝나면, **Eden 영역의 살아있는 모든 객체들은 두 개의 Survivor 영역 중 하나의 영역으로 복사되며 Eden 영역은 완전히 비워지게 된다.** 이를 **"Mark and Copy"** 라고 부른다.

<br>
### Survivor spaces

JVM에서는 Survivor space에 해당하는 두 개의 분리된 영역을 관리하는데 "from" / "to"로 나뉜다. 여기서 중요한 것은 **반드시 두 영역 중 하나는 비어있는 상태여야 하는 것이다.**

비워져 있는 Survivor 영역(to)은 **다음 Young 영역의 GC가 발생할 때, Eden 영역 및 다른 Survivor 영역(from)에 있던 객체가 이사오는 곳이다.** 그리고 이 GC가 끝난 후, "from"에 해당하는 Survivor 영역은 비워지게 되며 각 영역의 역할은 바뀌게 된다.

<br>
![07.png](/static/assets/img/blog/java/2018-02-03-what_is_garbage_collection/07.png)

이렇게 Survivor 영역 사이에서 일어나는 객체들의 복사 과정은 여러 번에 걸쳐서 일어나게 되는데, Young 영역에서의 GC가 일정 수준 이상으로 발생하였고 그 때까지도 살아남는 객체가 있다면 이 객체는 앞으로도 계속 사용될 확률이 높은 것으로 간주되는, 장수하는 객체로 분류된다.

장수하는 객체로 분류되면, **다음 Young 영역의 GC가 발생했을 때 다른 Survivor 영역으로 이동하는 것이 아니라 Old 영역으로 이동하게 된다.**

이렇게 장수하는 객체를 분류하기 위해서 JVM은 각 객체마다 age라는 값을 관리한다. GC가 일어날 때마다 살아남은 객체의 age 값은 증가하게 되며, 일정 수준 이상 도달했을 경우 그 객체는 Old 영역으로 이동하게 된다.

JVM에서 자바 애플리케이션을 실행시킬 때, 이 threshold를 정할 수 있다.

```
XX:+MaxTenuringThreshold=값
```

위의 값을 0으로 설정하면 아예 Survivor 영역을 사용하지 않는다는 것이고 (바로 Old 영역으로 이동하게 되므로), 기본 값은 15이다.

> Survivor 영역의 공간이 살아있는 모든 Young 영역의 객체를 수용할 수 없을 경우에도 Old 영역으로의 객체 이동이 일어난다.

<br>
### Old Generation

Old 영역에 대한 GC 구현은 Young 영역에 대한 GC 보다 더 복잡하다. Old 영역의 GC는 Young 영역의 GC보다 빈번하게 발생하지도 않고 (자바 애플리케이션을 이상하게 구현하지 않았다면), Old 영역의 객체들은 참조되고 있어 계속 살아있는 객체로 간주된다.

Old 영역에 대한 GC 알고리즘은 세부 GC 구현에 따라 다르긴 하지만, 보통 다음과 같이 수행한다.

* 특별히 reserved 된 bit를 통해 GC Root로부터 닿을 수 있는(reachable) 객체들 Mark한다.
* 닿지 않는(Unreachable) 객체들은 삭제한다.
* 메모리 단편화를 피하기 위해, Old 영역의 시작점부터 살아 있는 객체들을 모은다. (이 때 객체 복사가 발생한다.)

> Old 영역에 대한 GC는 어떻게 구현되었던 간에, 객체 할당에 실패할 정도의 메모리 단편화는 피해야 한다. (Compaction을 하지 않는 CMS GC도 메모리 단편화가 심해지면 Full GC를 수행한다.)


<br>
### PermGen

Java 8 이전 버전에서는 **"Permanent Generation**이라는 특수한 영역이 있었는데, 여기에는 class와 같은 메타데이터나 문자열과 같은 값들이 이 곳에 위치해 있었다. 

* Class의 meta 정보
* Method의 meta 정보
* Static 객체
* 상수화된 String 객체
* Class와 관련된 배열 객체 meta 정보
* JVM 내부적인 객체들과 JIT 컴파일러의 최적화 정보

이 영역의 크기가 얼마나 적당할지를 예상하는 것은 매우 어려운 것이라 자바 개발자에게 많은 고민을 안겨주었다. 이 영역이 부족해지면 Permgen space에 대한 OOM이 발생하기 때문이었다. 아무 생각없이 Collection 객체를 static 으로 선언하고 계속 값을 추가하다보면 OOM이 발생한다. 또한 메모리에 로딩된 클래스와 클래스 로더가 종료되었을 때 GC가 되지 않을 경우 메모리 누수가 발생하였다.

따라서 OOM이 발생하면, 이 문제를 해결하기 위한 방법으로 이 영역에 대한 크기를 늘려줌으로써 해결하였다. (최대 사이즈는 256MB 이다.)

```
java -XX:MaxPermSize=256m com.mycompany.MyApplication
```

<br>
### Metaspace

이렇게 필요한 PermGen 영역 크기를 예상하는 것은 어려운 것이었기 때문에, Java 8에서는 이 영역을 없애고, Metaspace 라는 새로운 영역이 생겼다. PermGen 영역에 저장하던 값들 중에 static 객체와 같은 값들은 다 일반 heap 영역에 저장하여 최대한 GC 대상이 되도록 하였다.

* Class의 meta 정보 -> Metaspace
* Method의 meta 정보 -> Metaspace
* Static 객체 -> Heap (Young or Old)
* 상수화된 String 객체 -> Heap (Young or Old)
* Class와 관련된 배열 객체 meta 정보 -> Metaspace
* JVM 내부적인 객체들과 JIT 컴파일러의 최적화 정보 -> Metaspace

Class 관련 meta 정보는 그대로 Metaspace 영역에 로드된다. 그리고 이 영역의 크기 제한은 **오직 JVM의 native 메모리 크기에 제한되며 JVM이 필요에 따라 리사이징할 수 있는 구조로 개선되었다.** 따라서 개발자들은 자바 클래스를 계속 추가함으로써 발생하는 PermGen 영역에 대한 OOM을 피할 수 있게되었다. 하지만 Metaspace 영역이 계속 커지게 되면 가상 메모리 부족으로 인한 swap이 많이 발생하게 될 것이다.

따라서 JVM은 Metaspace 영역의 크기를 제한할 수 있도록 옵션을 제공한다. 

```
java -XX:MaxMetaspaceSize=256m com.mycompany.MyApplication
```

<br>
# Minor GC vs Major GC vs Full GC

Heap 메모리에 있는 각기 다른 영역에 대한 GC는 종종 **Minor GC / Major GC / Full GC** 로 불리기도 한다. 여기서 중요한 것은 애플리케이션 스레드를 멈추는가? 그리고 얼마나 오래 걸리는가인 것이다.

<br>
## Minor GC

**Young 영역에 대한 GC를 Minor GC라고 한다**
Minor GC에 대해서 주의깊게 살펴보아야할 것은 다음과 같다.

1. Minor GC는 JVM이 새로운 객체를 생성하기 위해 충분한 메모리를 확보하지 못하면 무조건 발생한다. 보통 Eden 영역이 거의 full 인 상황일 것이다.  그래서 새로운 객체를 생성하는 일이 빈번하게 발생한다면, Minor GC도 그만큼 빈번하게 발생할 것이다.
2. Minor GC에서는 **Old 영역의 객체가 Young 영역의 객체를 참조하고 있을 경우, 이 Old 영역의 객체를 GC Root로 간주하고 Mark 한다.** Young 영역 객체가 Old 영역의 객체를 참조하고 있는 경우는 Mark 단계에서는 무시된다.
3. **Minor GC는 이름과는 다르게, 애플리케이션 스레드를 멈추는 Stop-The-World를 유발한다.** 이는 GC 알고리즘 종류에 상관없다. 일단 객체의 복사는 일어나기 때문이다. Eden 영역 대부분의 객체를 비울 수 있고, Survivor 영역 및 Old 영역으로의 복사가 일어나지 않는다면 이 애플리케이션 스레드의 멈춤은 무시할만한 수준이다. 그러나 반대일 경우에는 빈번하게 발생하는 애플리케이션 스레드의 멈춤이 눈에 띄게 느껴질 수 있다는 것이다.

> Minor GC의 정의는 간단하다. **Young 영역을 청소하는 것이라 생각하면 된다.**

<br>
## Major GC vs Full GC

Major GC와 Full GC는 다음과 같이 정의할 수 있다.

* **Major GC는 Old 영역에 대한 GC이다.**
* **Full GC는 Young 영역 및 Old 영역을 모두 포함한, 전체 Heap 영역에 대해 GC를 수행한다.**

이 GC들에 대해서 우리가 염두해두어야 할 것은 애플리케이션 스레드를 멈추는 Stop-The-World를 유발하느냐, 아니면 애플리케이션 스레드와는 별도로 동시에 수행될 수 있는가에 대해 알아두어야 한다.

> System.GC()를 명시적으로 호출하면 Full GC가 발생한다. 또한 Perm Gen 영역이 부족해질 경우에도 Full GC가 발생한다.