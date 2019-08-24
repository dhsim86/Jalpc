---
layout: post
title:  "디자인 패턴 08 - 복합체 (Composite)"
date:   2019-08-24
desc:  "디자인 패턴 08 - 복합체 (Composite)"
keywords: "디자인 패턴, Design Patterns, 생성 패턴, 복합체, Composite"
categories: [Programming]
tags: [Design Patterns]
icon: icon-html
---

복합체(Composite) 패턴은 **부분과 전체의 계층을 동일하게** 다룰 수 있도록, 구조를 트리 구조로 구성한다. 사용자로 하여금 **개별 객체와 복합 객체를 모두 동일하게 다룰 수 있도록 하는 패턴이다.**

포토샵이나 파워포인트와 같은 그래픽 요소들을 다루는 프로그램을 개발할 때, 이 프로그램에서 그래픽 요소를 표현하는 클래스가 존재한다고 하자. Graphic 인터페이스는 모든 그래픽 요소들이 정의해야할 연산을 정의하였고, 텍스트, 사각형, 선을 각각 표현한 Text, Rectangle, Line 클래스가 이 인터페이스를 구현하였다.

```java
public interface Graphic {
    String draw();
}

public class Line implements Graphic {
    @Override
    public String draw() {
        return "Line";
    }
}

public class Rectangle implements Graphic {
    @Override
    public String draw() {
        return "Rectangle";
    }
}

public class Text implements Graphic {
    @Override
    public String draw() {
        return "Text";
    }
}
```

그런데 이런 프로그램들은 각 그래픽 요소들을 그루핑하여 복잡한 그림을 표현할 때도 있다. 다양한 그래픽 요소들을 포함하여 하나의 그래픽 요소처럼 다루는 것이다. 이를 구현하기 위한 간단한 방법은 이 그래픽 요소들을 포함하는, 컨테이너처럼 동작하는 클래스를 추가로 정의하는 것이다.

하지만 이 접근 방법에는 문제가 있는데, 그래픽 요소와 컨테이너를 사용하는 코드에서는 이 클래스들을 각각 구분지어서 분기처리를 해야 할 수 있다. 즉, 그래픽 속성과는 관련이 없는 추가적인 속성을 필드로서 따로 추가해야 하고, 이 속성에 따라 분기하여 처리 대상이 컨테이너에 해당하는 것인지, 개별 그래픽 요소에 해당하는 것인지 판단하고 구현해야 하는 것이다.

그래픽 요소를 포함하는 컨테이너나 개별 그래픽 요소들을 **동일한 방식으로 다룰 수 있도록** 복합체 패턴을 사용할 수 있다. **복합체 패턴의 가장 중요한 요소는 이 기본 클래스와 이들의 컨테이너를 모두 표현하는 추상 클래스를 정의하는 것이다.** 밑의 코드는 그래픽 요소를 담당하는 클래스의 연산과 컨테이너에서 필요한 연산을 모두 포함하는 인터페이스이다.

```java
public interface Graphic {

    String draw();

    int add(Graphic graphic);
    int remove(Graphic graphic);
    List<Graphic> getChildren();

}


public class Line implements Graphic {

    @Override
    public String draw() {
        return "Line";
    }

    @Override
    public int add(Graphic graphic) {
        return 0;
    }

    @Override
    public int remove(Graphic graphic) {
        return 0;
    }

    @Override
    public List<Graphic> getChildren() {
        return Collections.emptyList();
    }
}

public class Picture implements Graphic {

    private List<Graphic> children = new ArrayList<>();

    @Override
    public String draw() {
        return children.stream()
            .map(Graphic::draw)
            .reduce((prev, cur) -> prev + ":" + cur)
            .get();
    }

    @Override
    public int add(Graphic graphic) {
        children.add(graphic);
        return children.size();
    }

    @Override
    public int remove(Graphic graphic) {
        children.remove(graphic);
        return children.size();
    }

    @Override
    public List<Graphic> getChildren() {
        return children;
    }
}

```

개별 그래픽 요소를 나타내는 Text, Reactangle, Line 클래스는 그리는 연산인 "draw" 만을 구현하고, 다른 그래픽 요소를 포함하지는 않으므로 "add"나 "remove", "getChildren"과 같은 연산은 구현하지 않는다. 이에 반해 컨테이너를 나타내는 클래스인 Picture는 자신이 포함하는 그래픽 요소를 다루는 연산과 그리는 연산 모두 구현한다. 또한 컨테이너는 또다른 자식 컨테이너를 포함할 수도 있으므로, 결국 이런 **복합 객체의 구조는 재귀적 특성을 지닌다.**

이렇게 구현하면 "부분"과 "전체"를 나타내는 객체들을 사용자 입장에서는 객체의 속성을 구분할 필요할 없이, Graphic 인터페이스에 정의된 연산만으로 "동일하게" 처리할 수 있다.

이와 같이 **복합체 패턴은 "부분 - 전체"의 객쳬 계통을 표현하고 싶을 때나, 사용자가 복합 객체와 개별 객체 사이의 차이를 몰라도 동일한 방식으로 다룰 수 있게 하고 싶을 때 사용할 수 있다.** 사용자는 복합 구조를 가지는 모든 객체를 똑같이 취급한다.

![00.png](/static/assets/img/blog/programming/2019-08-24-design_patterns_08/00.png)

위 그림과 같이 개별 객체와 객체들을 포함하는 복합 객체를 똑같은 인터페이스로부터 상속받아 구성한다. 집합 관계에 정의된 모든 객체에 대한 인터페이스(Component)를 정의한다. 사용자(Client)는 이 인터페이스에 정의된 연산으로 개별 / 복합 객체 구분없이 처리한다. 복합 객체는 개별 객체들을 포함한다. 복합 객체들은 또 다른 복합 객체를 가질 수 있으므로 밑의 그림과 같이 재귀적 구조로 나타날 수 있다.

![01.png](/static/assets/img/blog/programming/2019-08-24-design_patterns_08/01.png)

> 사용자 코드는 개별 / 복합 객체를 아우르는 공통 연산을 정의한 인터페이스만 알고 있고, 개별 / 복합 객체를 구분할 필요없이 일관적으로 구현될 수 있다. 따라서 사용자 코드는 단순해진다. 또한 새로운 종류의 구성요소를 쉽게 추가할 수 있다.

> 모든 객체에 대한 인터페이스(Component)는 개별 객체와 복합 객체에 정의된 모든 공통의 연산을 정의하고 있어야 한다. 이렇게 해야 사용자가 개별 / 복합 객체를 구분할 필요없이 코드를 작성할 수 있다. 단, 개별 객체는 복합 객체에만 의미있는, 개별 요소를 다루는 연산을 아무 일도 하지 않도록 구현하거나 예외를 던지게하여 구현할 수 있다.

> Garbage Collection 기능을 제공하지 않는 언어에서는 Leaf 객체를 삭제하는 책임을 Composite 클래스가 담당한다.