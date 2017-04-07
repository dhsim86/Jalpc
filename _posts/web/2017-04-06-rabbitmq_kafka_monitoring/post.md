---
layout: post
title:  "RabbitMQ and Apache Kafka monitoring"
date:   2017-04-06
desc: "RabbitMQ and Apache Kafka monitoring"
keywords: "server programming"
categories: [Web]
tags: [server programming]
icon: icon-html
---

# RabbitMQ and Apache Kafka monitoring

RabbitMQ와 Apache Kafka 모두 운영하기 위한 monitoring feature를 제공한다.
각 MQ를 위한 monitoring tool을 통해 현재 사용 중인 메시징 시스템의 정보나 사용자 관리, 큐 관리 등을 쉽게 진행할 수 있다.

이 포스트에서는 RabbitMQ 와 Apache Kafka의 monitoring tool을 통한 기본 운영법에 대해 간략한 내용을 담는다.

<br>
## RabbitMQ

먼저 RabbitMQ management feature를 통해 어떻게 관리할 수 있는지 알아보자.

RabbitMQ는 기본적으로 **rabbitmqctl** 이라는 **command line tool** 을 통해 노드의 상태 확인 및 관리할 수 있고, virtual host, 권한 설정도 진행할 수 있다.

<br>
### rabbitmqctl 사용

RabbitMQ를 설치했으면, **rabbitmqctl [commands]** 를 통해 command를 수행할 수 있다.

**rabbitmqctl status** 를 통해 현재 RabbitMQ의 노드 상태를 터미널에서 확인할 수 있다.
<br>
![00.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/00.png)

위와 같이 rabbitmqctl을 사용하면 터미널에서 command 입력을 통해 RabbitMQ를 관리할 수 있다.
다음은 rabbitmqctl을 통해 사용할 수 있는 command 들 중 일부를 나타낸 것이다.

* status: 노드의 상태를 간략히 확인한다. 현재 running 중인 애플리케이션이나, 메모리 상태 등을 확인할 수 있다.
* add_user {username} {password}: 계정 추가
* delete_user {username} : 계정 삭제
* set_user_tags {username} {tags...}: 태그 정보 설정, 이 command를 통해 특정 유저를 administrator 로 지정할 수 있다.
* list_users: 현재 등록된 유저 계정 및 권한을 보여준다.

<br>
### rabbitmq_management plugin 사용

**rabbitmqctl** 은 터미널에서 사용하는 command line tool이라 관리자가 좀 더 쉽게 관리할 수 있도록 웹브라우저를 통해 관리할 수 있는 feature를 **rabbitmq_management** 플러그인을 통해 지원한다.

이를 사용하기 위해 RabbitMQ 설치 후 다음과 같이 management 플러그인을 설치하자. 플러그인 설치 후 RabbitMQ를 restart 해야 한다.
~~~
sudo rabbitmq-plugins enable rabbitmq_management
sudo service rabbitmq-server restart
~~~

그리고 다음과 같이 웹브라우저를 통해 사용자 계정으로 로그인하기 위해 다음과 같이 관리자 계정을 설정한다.
guest 계정을 기본적으로 제공하기는 하지만 로그인을 하지는 못할 것이다. 따라서 일단은 **rabbitmqctl** command를 통해 관리자 계정을 추가한다.
~~~
sudo rabbitmqctl add_user dongho 1234
sudo rabbitmqctl set_user_tags dongho administrator
~~~

이렇게 관리자 계정 등록 후, 웹 브라우저로 접속하면 **(디폴트는 http://servier_ip:15672)** 로 접속하면 다음과 같은 화면이 나온다.
<br>
![01.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/01.png)

이 화면에서 아까 등록한 관리자 계정으로 로그인하면 다음과 같이 관리 페이지를 확인할 수 있을 것이다.
<br>
![02.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/02.png)

이 관리페이지를 살펴보면 현재 노드의 정보나 config, log path, 포트 번호를 확인할 수 있으며 다음과 같이 메시지 큐에 대한 정보도 확인할 수 있다.
<br>
![03.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/03.png)

<br>
## Apache Kafka

이번에는 Apache Kafka를 통해 어떻게 monitoring을 할 수 있는지 알아보자.

먼저 다음과 같이 **Apache Zookeeper** 를 실행시켜야 한다.
<br>
![04.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/04.png)

**zoo.cfg** 를 보면 알겠지만 포트번호가 **2181** 로 되어 있다. Kafka를 monitoring 하기 위해 **[Yahoo Kafka Manager][kafka-manager]** 를 사용할 것인데 이 때 zookeeper의 port 번호를 요구한다.

다음과 같이 kafka 및 kafka-manager를 실행시키자. kafka-manager를 빌드하는 방법은 kafka-manager의 [github 페이지][kafka-manager]를 확인하도록 하자.
<br>
![05.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/05.png)

여기서는 다음과 같이 kafka 및 kafka-manager를 실행시켰다.
~~~
bin/kafka-server-start.sh -daemon config/server.properties
~~~
* Kafka를 실행할 때는 기본 server.properties를 통해 실행하였다.

~~~
bin/kafka-manager -Dkafka-manager.zkhosts=localhost:2181 -Dconfig.file=conf/application.conf -Dhttp.port=8777
~~~
* kafka-manager를 따로 실행해야하는데, 기본 configuration을 통해 실행하였으며 포트번호를 8777로 주었다. 또한 실행 중인 zookeeper의 포트번호를 설정해주어야 한다.

위와 같이 실행하고 **localhost:8777** 로 접속하면 다음과 같이 kafka manager page를 확인할 수 있을 것이다.
<br>
![08.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/08.png)

위의 메뉴에서 **Add Cluster** 를 통해 클러스터를 생성할 수 있다.
<br>
![07.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/07.png)

생성한 클러스터를 클릭해보면, broker나 topic, consumer 같은 정보를 확인하여 모니터링할 수 있도록 지원한다.
<br>
![09.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/09.png)
<br>
![10.png](/static/assets/img/blog/web/2017-04-06-rabbitmq_kafka_monitoring/10.png)


[kafka-manager]: https://github.com/yahoo/kafka-manager
