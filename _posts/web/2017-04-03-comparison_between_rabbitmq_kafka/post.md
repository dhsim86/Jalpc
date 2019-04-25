---
layout: post
title:  "Comparison between RabbitMQ and Apache Kafka"
date:   2017-04-03
desc: "Comparison between RabbitMQ and Apache Kafka"
keywords: "kafka, messaging, rabbitmq, RabbitMQ"
categories: [Web]
tags: [server programming]
icon: icon-html
---

# Comparison between RabbitMQ and Apache Kafka

사용자에게 최적의 서비스를 제공하기 위한 시스템을 구성하기 위해 선택하는 메시징 시스템의 선택은 간단하지가 않다. 각 메시징 시스템은 각자 자신의 고유한 특성을 가지고 있고 그 특성에 따라 구성된 시스템의 성능이나 안정성이 크게 달라질 수가 있다. 따라서 메시징 시스템의 선택은 모든 방면에 대해 고려하여 자신이 서비스할 시스템의 특성에 맞게 해야한다.

여기서는 **Apache Kafka** 와 **RabbitMQ** 을 간략하게나마 비교해보려고 한다.

<br>
## 특징면

메시징 시스템에서의 broker는 producer와 consumer라는 두 개 타입의 프로세스와 연결되어 있는데, 보통 메시징 시스템에서는 consumer가 각 메시지의 최종 목적지이며, consumer의 메시지 처리 속도가 메시징 시스템을 사용하는 전체 시스템의 성능과 직결된다.

Kafka와 RabbitMQ 를 특징면에서 비교해보기 위해 다음과 같은 환경이 있다고 하자.

<br>
![00.png](/static/assets/img/blog/web/2017-04-03-comparison_between_rabbitmq_kafka/00.png)

여기서는 비교적 메시지 처리 속도가 빠른 **"fast"** 한 consumer 및 처리 속도가 느린 **"slow"** consumer가 있다.

* Data: 메시지는 consumer가 처리할 데이터를 포함하고 있는데, 이 메시지 하나를 받는 것만으로 consumer는 다른 모듈이나 consumer 를 기다릴 필요없이 바로 처리할 수가 있다. 이 것은 consumer가 이 메시지를 처리하는데 추가적으로 다른 커맨드나 데이터를 입력받을 필요없이 처리할 수 있다는 것을 의미한다. 여기서는 이 **Data** 를 처리하는 consumer를 **"fast" consumer** 라고 칭한다.
* Command: 메시지는 consumer가 읽어서 처리해야할 명령어를 담고 있는데, 경우에 따라서 consumer는 해당 명령어를 처리하기 위해 추가적인 파라미터나 다른 모듈과의 인터랙션을 통해 작업 결과를 입력받아야 할 필요가 있다. 또한 다른 모듈과의 인터랙션을 할 때 다음과 같이 **Internal interaction** 과 **External interaction** 이 있다.
  * Internal interaction: Consumer는 다른 모듈과 함께 작업을 처리할 때 함수 호출과 같이 코드 상에서 인터랙션을 하거나 같은 네트워크 상에서의 통신을 할 수 있다. **다른 모듈** 의 작업 처리 속도에 따라서 이런 consumer를 **"fast"** or **"slow"** consumer라 칭할 수 있다.
  * External interaction: Consumer는 작업을 처리하기 위해 서로 다른 네트워크 상의 통신이나 구축된 시스템이 아닌 다른 제 3자의 서버를 통해 처리할 필요가 있다. 이러한 consumer를 **slow consumer** 라 칭한다.

그럼 이러한 컨셉에서 Kafka와 RabbitMQ 를 비교해보자.

<br>
## Kafka의 강점

Kafka는 RabbitMQ에 비해 강력한 성능을 뽐낸다. [apache-kafka-vs-rabbitmq][benchmark_url] 에서도 볼 수 있겠지만 Kafka가 RabbitMQ에 비해 우월한 성능을 보이고 있다.

<br>
![01.png](/static/assets/img/blog/web/2017-04-03-comparison_between_rabbitmq_kafka/01.png)
<br>
![02.png](/static/assets/img/blog/web/2017-04-03-comparison_between_rabbitmq_kafka/02.png)

이 것은 다음과 같이 디자인된 Kafka의 특성에 기인한다.
* 메시지는 partition으로 나뉘어진 topic에 큐잉되는데, 이 partition들을 horizontal하게 scale-out 하면서 성능 향상을 꾀할 수 있다.
* 메시지는 로깅 시스템처럼 순차적으로 쌓고, 순차적으로 디스크에 write 함으로써 비록 Kafka가 메시지를 파일 시스템에 저장할지라도 성능 하락폭을 크게 줄일 수 있다.
* Consumer가 직접 broker로부터 메시지를 가져가기 때문에 broker 입장에서는 consumer가 지금 놀고 있는지, 아니면 어떠한 메시지를 처리하고 있는지 관리할 필요가 없어 부담이 경감된다.
* [Zero-copy][zero-copy]를 활용하여 각 레이어 간의 불필요한 데이터 복사 및 컨텍스트 스위칭을 피한다.

따라서 보통 Kafka를 사용한다면 시스템에 **"fast" consumer** 가 있을 때 유리하다. 메시지를 빠르게 처리하는 환경에서는 Kafka의 장점을 100% 활용할 수 있기 때문이다. 물론 **"slow" consumer** 가 있어도 메시징 처리에는 Kafka가 빠른 처리 속도를 보일 수는 있다.
하지만 Kafka에서는 한 consumer group에서 어느 특정 consumer만이 partition에 접근할 수 있으므로, **"slow" consumer** 가 메시지를 처리하는 동안 그 consumer가 바라보는 (즉 어떤 partition의 leader 일 때) partition의 메시지 처리가 블록이 된다는 것을 의미한다. 하지만 Kafka의 구성을 어떻게 하느냐에 따라 다른 consumer group의 consumer가 그 메시지를 처리하게 할 수는 있다. (물론 이 메시지를 중복 처리할 때의 문제점이 없거나 해소할 경우에만, Kafka는 consumer group 들 사이에서는 브로드캐스팅하는 발행-구독 모델이다.)

<br>
## RabbitMQ의 강점

RabbitMQ는 Kafka에 비해 비교적 **성숙한** 메시징 시스템이고, 사용하기 쉬울 뿐더러 운영면에서도 편한 점이 많다. 비록 위의 그래프에서와 같이 메시지 처리 속도는 Kafka 이 비해 열세랄지라도 서버 추가를 통해 성능을 높일 수도 있다.

RabbitMQ는 다음과 같은 디자인을 따르고 있다.
* 메시지는 큐에 추가되며, 복수의 consumer가 큐에 접근하여 메시지를 처리할 수 있다.
* Broker는 메시지를 가용한 모든 consumer에게 분산시킬 수 있고, 비록 consumer가 처리하지 못하는 경우에 그 메시지를 다시 재전달할 수도 있다.
* 만약 어떤 큐에 접근하는 consumer가 하나일 때 그 큐의 메시지들간의 처리 순서는 보장된다.

RabbitMQ도 **"fast"** 한 consumer가 있을 때에 더 좋겠지만, 만약 우리 시스템에서 consumer의 속도가 **"slow"** 할 때 다음과 같은 장점을 지닐 수 있다. 만약 consumer의 메시지 처리 속도가 느려 그 다음 메시지를 처리하지 못하고 큐에 쌓이는 경우에, 그 큐에 메시지를 처리할 consumer를 추가하는 것만으로도 이 문제를 해결할 수 있다. (물론 이 것은 두 메시지 간의 처리 순서가 상관없을 때의 이야기이다.)

<br>
## 결론

Kafka와 RabbitMQ, 두 메시징 시스템 모두 좋은 시스템이지만 다음과 같은 선택을 고려해볼 수 있다.

만약 단위 시간 당 처리해야할 메시지의 수가 많고, consumer가 메시지를 처리하는 것이 빠른 시스템을 구축하고자 할 때는 RabbitMQ를 쓰는 것보다 Kafka를 사용하여 높은 성능의 시스템을 구축할 수 있을 것이다. Consumer가 메시지를 처리하는 것이 느리고, 메시지를 처리하는 순서는 상관이 없을 때는 RabbitMQ를 써서 시스템의 자원을 최대한 활용하도록 하는 것이 좋을 것이다.

<br>
## 참고

[Kafka or RabbitMQ: depends on your messages nature][kafka_rabbitmq] <br>
[Apache Kafka v/s RabbitMQ – Message Queue Comparison][benchmark_url] <br>
[Why Kafka so fast (stackoverflow)][why_kafka_so_fast] <br>

[zero-copy]: https://www.ibm.com/developerworks/linux/library/j-zerocopy/
[kafka_rabbitmq]: https://yurisubach.com/2016/05/19/kafka-or-rabbitmq/
[benchmark_url]: http://www.cloudhack.in/index.php/2016/02/29/apache-kafka-vs-rabbitmq/
[why_kafka_so_fast]: http://stackoverflow.com/questions/32631064/why-kafka-so-fast
