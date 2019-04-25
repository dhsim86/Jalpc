---
layout: post
title:  "Intellij IDEA Community Edition에서 external tomcat 실행"
date:   2017-06-01
desc: "Intellij IDEA Community Edition에서 external tomcat 실행"
keywords: "tomcat, intellij, idea, intellij idea"
categories: [Web]
tags: [server programming]
icon: icon-html
---

# Intellij IDEA Community Edition에서 external tomcat 설정 및 debugging

<br>
## Intellij IDEA Community Edition

Intellij IDEA Community Edition 은 오픈소스로 Apache 2.0 라이센스 하에 무료로 배포된다. 개인용, 상업용으로 누구나 사용할 수 있지만, 지원하는 기능이 적다.

[Intellij IDEA Choose Edition][choose-edition]
<br>
[Intellij IDEA Ultimate Edition vs Community Edition][versus-edition]
<br>
[Ask about Community Edition License][askabout-edition]

<br>
![00.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/00.png)

<br>
## Spring Boot Application

Intellij IDEA Community 에서는 비록 spring을 정식으로 지원하지 않지만, Spring Boot는 embedded tomcat이 있고, standalone으로 일반 java application 처럼 실행할 수 있기 때문에 main 클래스에서 다음과 같이 run이나 debug를 수행하면 된다.

<br>
![01.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/01.png)

<br>
## 외부 tomcat 설정 및 실행

Spring MVC와 같이 web resource를 deploy하고, 외부 tomcat을 사용하는 것이라면 추가 설정이 필요하다. (물론 Intellij IDEA Ultimate Edition을 사용하면 바로 사용할 수 있다.)

<br>
### maven pom.xml에 maven-war-plugin 추가

Web resource deploy를 위해 pom.xml에 다음과 같이 추가한다.

~~~xml
<build>
  <finalName>webdev</finalName>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <source>1.8</source>
        <target>1.8</target>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-war-plugin</artifactId>
      <version>${maven.war.plugin-version}</version>
      <configuration>
        <webXml>${webXmlPath}</webXml>
      </configuration>
    </plugin>
  </plugins>
</build>

<properties>
  <maven.war.plugin-version>2.4</maven.war.plugin-version>
  <webAppDir>target/classes</webAppDir>
  <webXmlPath>src/main/webapp/WEB-INF/web.xml</webXmlPath>
</properties>
~~~

<br>
### Tomcat Runner plugin 설치

* 먼저 Tomcat Runner 라는 [Intellij plugin][tomcat-runner]을 따로 설치해야 한다.
* 설치하면 **Run Configuration** 메뉴에서 다음을 확인할 수 있다.
![02.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/02.png)

  * Tomcat Installation: Tomcat이 설치된 디렉토리 설정
  * Modules: 자신이 개발하고 있는 web application의 루트 디렉토리 설정
  * VM Args
    * 일반 실행: **-Xms256m -Xms1024m** 과 같이 필요한 옵션 설정
    * 디버깅 실행: **-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=9999** 추가
  * Before launch
    * Tomcat이 실행되기 전에 수행할 작업을 명시
    * maven goal로 **compile war:exploded** 추가

* 다음은 위와 같이 설정하였을 때의 모습이다.
![03.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/03.png)

* 위와 같이 설정 후 실행하면 Tomcat이 실행되는 것을 확인할 수 있다.
![04.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/04.png)

<br>
## Tomcat remote debugging

Intellij IDEA Community Edition에서는 자체적으로 spring을 지원하지 않으니 당연히 디버깅 feature도 지원하지 않는다. Web application을 디버깅하기 위해서는 tomcat remote debugging을 통해 디버깅을 진행할 수 있다.

<br>
### Tomcat 실행시 java option 추가

* Tomcat 실행할 때 debug 옵션을 추가하여 IDEA에서 tomcat과 remote로 통신하면서 디버깅을 진행한다.
  * 아까 전의 Tomcat Runner plugin 에서 다음 java option을 추가한다.
  * Debugging을 위한 포트 번호를 **9999** 로 설정하였다.

~~~
-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=9999
~~~

<br>
### Remote run configuration

* 먼저 아까 전과 같이 tomcat 실행 후, **Run Configuration** 메뉴에서 **Remote** 를 추가한다.
  * 다음과 같이 port 번호를 9999로 설정한다.
![05.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/05.png)

<br>
* 다음과 같이 디버깅을 시작할 때 target VM에 접속이 되었나는 메시지를 확인할 수 있을 것이다.
  * 이전에 debug 옵션을 준 tomcat이 실행된 상태여야 한다.
  <br>
  ![06.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/06.png)
  ![07.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/07.png)

<br>
* 디버깅 진행할 때, 다음과 같이 breakpoint가 걸리고, 변수 값과 스택 프레임도 확인할 수 있을 것이다.
![08.png](/static/assets/img/blog/web/2017-05-27-intellij_idea_community_tomcat/08.png)


[choose-edition]: https://www.jetbrains.com/idea/#chooseYourEdition
[versus-edition]: http://www.jetbrains.org/display/IJOS/Ultimate+Edition+vs.+Community+Edition
[askabout-edition]: https://intellij-support.jetbrains.com/hc/en-us/community/posts/206883615-Ask-about-Community-Edition-License
[tomcat-runner]: https://plugins.jetbrains.com/plugin/8266-tomcat-runner-plugin-for-intellij
