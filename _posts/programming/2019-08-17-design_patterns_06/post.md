---
layout: post
title:  "디자인 패턴 06 - 어댑터 (Adapter)"
date:   2019-08-12
desc:  "디자인 패턴 06 - 어댑터 (Adapter)"
keywords: "디자인 패턴, Design Patterns, 생성 패턴, 어댑터, Adapter, 적응자"
categories: [Programming]
tags: [Design Patterns]
icon: icon-html
---

어댑터 (Adapter, 적응자) 패턴은 활용하고자 하는 클래스의 인터페이스를, 사용자가 기대하는 인터페이스로 사용할 수 있도록 **적응(변환)**하는 패턴이다. 아무런 연관이 없거나, 서로 일치하지 않는 인터페이스를 갖는 클래스들끼리 통합하여 구현해야할 때, 이 패턴을 사용할 수 있다.

예를 들어 다음와 같은 코드가 구현되어 있다고 하자.

```java

public interface Alarm {

    void sendText(String text);
    void sendImage(File image);
}

public class MailAlarm {

    public void sendText(String text) {
        ...
    }

    public void sendImage(File image) {
        ...
    }

}

public static void main() {
    Alarm alarm = new MailAlarm();
    alarm.sendText("Alarm Message");
}
```

클라이언트는 정해진 인터페이스를 통해 알람을 보낸다고 하자. 현재 구현된 것은 메일을 통해 알람을 보낼 수 있도록 구현되어 있다. 그런데 추가된 요구사항에 의해 SMS로도 알람을 보낼 수 있어야 한다고 하자. SMS로 알람을 보낼 수 있는 라이브러리 클래스는 다음과 같이 구현되어 있다.

```java

public class SmsTransferLib {

    public void sendMessage(char[] message);
    public void sendMessage(char[] message, File image);

}
```

위의 클래스를 이용하여 SMS로도 알람을 보낼 수 있도록 해야하는데, 이 클래스는 현재 구현된 인터페이스 (Alarm)과 맞지 않다. 따라서 이를 사용하려면 클라이언트의 코드를 변경해야 한다. 물론 위의 예에서는 연산이 몇개 되지 않아 쉽게 바꿀 수 있겠지만, 또 어떤 추가 요구사항이 발생할지 알 수 없고 알람을 보내는 형식에 따라 계속 클라이언트 코드가 변경되는 것은 좋지 않아보인다.

코드에서 사용 중인 인터페이스와 맞지 않는 클래스를 사용하고자 할 때 어댑터 패턴을 사용하면, **여러 곳에서 코드 변경할 필요없이 클라이언트 입장에서는 동일한 인터페이스를 사용하도록 구현할 수 있다.**

어댑터 패턴은 다음 두 가지 방법으로 구현할 수 있다.

![00.png](/static/assets/img/blog/programming/2019-08-17-design_patterns_06/00.png)

* 현재 사용 중인 인터페이스와 필요한 클래스를 전부 상속하여 구현
   * Alarm 인터페이스와 SmsTransferLib을 모두 상속받는 SmsAlarm 클래스를 정의
   * 이 방법은 만약 Adaptee에 여러 서브 클래스가 존재하는 경우 부적합하다. 모든 서브 클래스들에 대해 상속을 따로 해야된다. 또한 Adaptee의 서브 클래스에만 정의된 기능은 사용할 수 없다.
   * Adaptee를 상속하므로, Adaptee의 연산을 오버라이딩하여 재정의할 수도 있다.

![01.png](/static/assets/img/blog/programming/2019-08-17-design_patterns_06/01.png)

* 현재 사용 중인 인터페이스만을 상속받아 클래스로 구현하고, 기능 구현에 필요한 클래스는 필드로 참조
   * Alarm 인터페이스를 상속받아 SmsAlarm 클래스를 정의하고 이 클래스의 필드로 SmsTransferLib 인스턴스를 참조하여 필요한 기능을 구현한다.
   * Adaptee에 여러 서브 클래스가 존재하더라도 문제가 없다. 그냥 서브 클래스의 인스턴스를 참조하도록 구현하면 된다.
   * Adaptee의 연산을 재정의할 수는 없다.

어떤 방법으로 구현하든, 결국 클라이언트 입장에서 사용하는 인터페이스로 통합시키는 SmsAlarm 클래스를 어댑터(Adapter)라고 부른다. 이 패턴은 위와 같이 **기존 클래스를 사용하고 싶은데 인터페이스가 맞지 않는 경우에 사용할 수 있다.**

어댑터는 가끔 **타겟 클래스(Adaptee)가 제공하지 않는 기능을 제공하는 책임도 지닐 때도 있다.** 타겟 클래스가 필요한 기능을 제공하지 않을 경우, 어댑터에서 직접 구현할 수도 있다. 어댑터를 구현하는 작업은 Adaptee와 클라이언트가 사용 중인 인터페이스와 얼마나 유사한지에 따라 달라진다. 연산의 이름을 변경하는 정도의 수준일 수도 있지만, 복잡하게 구현될 수도 있다.

반대로 원래 Adaptee 인터페이스를 사용하던 클라이언트에서 Adapter 인터페이스를 구현한 객체를 사용할 경우 (위의 예에서는 sendMessage 연산을 가지는 SmsTransferLib 클래스를 사용하던 클라이언트가 Alarm 인터페이스를 구현하는 MailAlarm을 사용하고자 할 경우), **양방향 어댑터**를 사용할 수 있다. 양방향 어댑터는 두 인터페이스를 모두 만족하는 클래스이다. 다중 상속이 가장 좋은 방법이다.

> 가교(Bridge) 패턴은 어댑터 패턴과 유사하지만, 사용 목적이 다르다. 가교 패턴은 구현 코드와 추상 개념을 분리하여 서로에게 영향을 주지 않고 서로 확장할 수 있도록 하기 위함이고, 어댑터 패턴은 호환되지 않는 객체의 인터페이스를 사용할 수 있도록 하기 위한 목적이다.

> 인터페이스 변경을 일으키는 어댑터 패턴과는 다르게, 데코레이터(Decorator) 패턴은 인터페이스의 변경없이 객체에 새로운 기능을 추가하기 위한 목적이고 재귀적 객체 합성을 통해 여러 기능을 추가할 수 있다.

[Adapter Example
](https://github.com/dhsim86/design_pattern_study/commit/7dff7e52a469594f9f78bd988f55df3f6e943bb7)