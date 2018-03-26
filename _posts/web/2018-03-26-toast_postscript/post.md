---
layout: post
title:  "TOAST 클라우드를 이용한 Judge 서버 구축기"
date:   2018-03-25
desc: "TOAST 클라우드를 이용한 Judge 서버 구축기"
keywords: "judge, toast cloud"
categories: [Web]
tags: [judge]
icon: icon-html
---

## TOAST 클라우드를 이용한 Judge 서버 구축기

[BOJ](https://www.acmicpc.net/)나 [알고스팟](https://algospot.com/)과 같은 사이트에서 알고리즘 문제들을 풀어보면서, 직접 문제도 만들어보기도 하고 지인들과 소규모 대회를 열어보기 위해 Online Judge 시스템을 구축하고자 하였다.

사실 Online Judge 시스템을 구축하는 것은 어렵지 않다. 굳이 직접 사이트를 제작할 필요도 없이, 쉽게 배포 및 사용할 수 있도록 Github에서 오픈소스로 공개되어 있는 것이 있다.

* [DMOJ - A modern contest platform for the modern web.](https://github.com/DMOJ)
* [OnlineJudge - An onlinejudge system based on Python and Vue.](https://github.com/QingdaoU/OnlineJudge)
* [Sharif Judge - A a free and open source online judge for C, C++, Java and Python programming courses.](https://github.com/mjnaderi/Sharif-Judge)

사이트는 위의 공개되어 있는 것으로 사용하기로 하고, 서버를 어떻게 구축할 것인가에 대하여 고민할 필요가 생겼다.
이런 Online Judge 시스템에서는 많은 사용자들이 알고리즘 문제를 풀고 자신들의 코드를 사이트에 올려 패스하는지 알아본다. 

<br>
![00.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/00.png)

**"자신들의 코드를 사이트에 올려 문제를 통과하는지 알아본다."** 라는 것은 서버에서 사용자들의 코드를 빌드해서 실행시켜본다는 것이고, 이는 CPU의 자원을 많이 소모한다는 것을 의미한다. 당연히 많은 사용자들이 특정 시간에 요청을 하게 되면 서버에 과부하를 일으키게 될 것이다.

이에 대비한다고 좋은 성능의 서버들을 미리 구축해놓자라는 생각도 들기는 했지만 좋은 방법인지는 의구심이 들었다. **얼마나 많은 사용자들이 사이트를 사용할 지도 예측하기가 힘들었고, 시간대에 상관없이 사용자들이 많을 것이라는 생각은 들지 않았기 때문이다.** (새벽에도 알고리즘 문제들을 풀어보는 코딩 덕후가 있긴 하겠지만.)

또한 정해진 갯수의 서버로 운영한다는 것은 사용자가 많을 때는 대처하기가 힘들고, 적을 때는 서버가 놀고 있다는 것을 의미한다. 서버는 상당히 비싼 자원(적어도 나에게 있어서는)이기 때문에 사용자의 수에 따라 서버가 유동적으로 늘었다가 줄어드는 것이 필요했다. 이를 **Auto Scaling** 이라고 하는데, [AWS](https://aws.amazon.com/ko/autoscaling/)나 [Azure](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/autoscale), [Google Cloud](https://cloud.google.com/compute/docs/autoscaler/) 등과 같은 여러 클라우드 서비스에서 이미 제공하고 있다.

나는 Judge 서버를 구축하면서 [TOAST](https://toast.com/) 를 사용하기로 했다. AWS를 사용하면서 인스턴스를 잘못 설정했다가 요금 폭탄을 맞은 적도 있고(물론 잘 해결해서 넘어가기는 했지만), 새로운 클라우드 서비스를 써보는 것도 나쁘지 않다고 생각했다.

<br>
## **TOAST 사용**

TOAST 클라우드에서도 많은 서비스를 다음과 같이 제공하고 있다.

<br>
![01.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/01.png)

앞서도 언급했듯이 Judge 서버를 구축하기 위해 필요한 것은 사용자들의 수에 따라 유동적으로 서버의 수가 결정되는 **Auto Scaling** 이다. TOAST에서는 **[Auto Scale](https://toast.com/service/compute/auto_scale)** 이라는 이름으로 서비스를 하고 있다.

<br>
## **RDS for MySQL**

이번에 구축하고자 하는 Judge 사이트도 회원 정보나 문제들을 저장할 DB가 필요하다. 물론 서버에서 직접 DB를 설치하고 사용할 수도 있겠지만 Auto Scale 때문에 사이트가 운영될 서버와는 별도의 서버에서 돌아가야 했다.

TOAST 에서는 **[RDS for MySQL](https://toast.com/service/database/rds_for_mysql)** 이라는 이름으로 DB 인스턴스를 제공하고 있었다. 이 서비스를 통해 DB를 구축해놓고 Judge 서버에서는 이 DB를 사용하면 될 것이다.

서비스를 enable 하면 다음과 같은 화면이 뜬다. 이 콘솔에서 DB 인스턴스를 생성하고 사용하는 것으로 보인다.

<br>
![03.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/03.png)

**생성** 버튼을 누르면 DB 인스턴스를 생성하기 위한 화면이 나오는데 위와 같이 필요한 정보를 입력한 후 **다음** 버튼을 누른다. 

---

<br>
![04.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/04.png)

위의 그림은 백업 & Access 제어 화면인데 자동적으로 DB를 백업해주는 용도로 보인다.

---

<br>
![05.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/05.png)

위와 같이 DB 인스턴스에 대해서 MySQL 설정을 지정할 수가 있었다.
DB 인스턴스를 생성하면 다음과 같은 화면을 볼 수 있는데 모니터링 및 로그 확인 기능도 제공하는 것을 알 수 있었다.

---

<br>
![06.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/06.png)

그림에서는 보이지 않지만 접속 정보에는 DB에 접속하기 위한 IP 및 지정한 Port 번호가 뜬다. 이 정보를 통해 해당 DB에 접속할 수 있다. DB 인스턴스를 생성해놓았으니 사이트를 본격적으로 구축한다.

<br>
## **Auto Scale**

TOAST의 Auto Scale를 사용하기 위해서는 먼저 **인스턴스 템플릿**이라는 것을 만들어야 하는데, Auto Scale 진행시 자동으로 생성되는 인스턴스의 속성이라고 나와있다. 

[Auto Scale - Overview](https://docs.toast.com/en/Compute/Auto%20Scale/en/overview/)

인스턴스 템플릿을 통해, 자동으로 생성되는 서버의 이미지 (서버 디스크)를 지정할 수 있는데 다음 그림에서 볼 수 있듯이 여러 OS를 지원하는 것을 확인할 수 있다.

<br>
![07.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/07.png)

Auto Scale 진행될 때마다 OS가 미리 설치되어 있는 이미지를 통해 서버가 생성된다.
그런데 구축하고자 하는 사이트의 서버는 **nginx와 같은 서버 설정 및 Judge 시스템이 미리 구축되어 있어야 한다.** Auto Scale 진행할 때마다 서버 설정하고 시스템을 구축할 것은 아니지 않는가?

이를 위해 인스턴스를 하나 생성해서 서버를 구축해놓았다가 이 서버의 이미지를 뜬 다음에, 이 이미지를 통해 인스턴스 템플릿을 만들어야 한다. 그래야 Auto Scale 진행시 이 이미지를 통해 서버를 자동 생성하고 바로 서비스를 할 수 있다.

---

<br>
### 서버 이미지 생성 - 1. Key Pair 생성

서버 이미지를 생성하기 위해 인스턴스를 생성하기 전에, 먼저 Key Pair를 생성해야 한다. TOAST 인스턴스에 접속하기 위해서는 Key Pair를 통해 인증을 거치기 때문이다. 

[Instance - Overview](http://docs.toast.com/en/Compute/Instance/en/overview/)

다음과 같이 Instance 메뉴에서 Key Pair를 생성할 수 있다.

<br>
![08.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/08.png)

Key Pair를 생성하면 .pem 파일을 자동으로 다운로드받게 되는데 인스턴스 접속시 이 파일을 가지고 접속을 하게 된다.

---

<br>
### 서버 이미지 생성 - 2. Security Group 설정

VPC에서 Security Group을 지정한다. 용도는 쉽게 말해서 외부 <-> 서버 인스턴스 사이에 통신 가능한 port 및 protocol을 지정하는 것이다. 사이트를 구축할 것이므로 80번 포트 및 ssh 접속을 위한 22번 포트를 사용할 것인데, 이렇게 자주 사용되는 포트들은 미리 Rule이 정의되어 있어 사용할 수 있게 해놓았다.

<br>
![09.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/09.png)

위의 화면과 같이 사용하고자하는 Rule을 추가해놓으면 다음과 같이 추가된 Rule들을 확인할 수 있다.

<br>
![10.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/10.png)

이제 서버 인스턴스 생성시에 이 Security Group을 지정하면 HTTP 요청 및 SSH 접속을 할 수 있을 것이다.

---

<br>
### 서버 이미지 생성 - 3. Floating IP 추가 / 연결

생성될 인스턴스에 SSH 접속을 위해 Floating IP를 추가해야 한다. TOAST에서 제공하는 서버 인스턴스에 외부에서 엑세스하기 위해서는 Floating IP 기능을 사용해야 한다. 다음과 같이 VPC에서 Floating IP를 생성할 수 있다.

<br>
![11.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/11.png)

---

<br>
### 서버 이미지 생성 - 4. 인스턴스 생성 및 사이트 구축

이제 본격적으로 서버를 구축한다. 여기서 Judge 시스템 구축 및 서버 설정을 해놓고, 접속 테스트를 진행한 후에 Auto Scale을 위한 서버 이미지를 생성할 것이다.

다음과 같이 사용할 OS 및 인스턴스 설정을 진행한다. **Select Flavor** 메뉴에서 인스턴스의 사양을 지정할 수 있다. 각자 사용하고자 하는 서버의 용도에 따라 지정한다.

<br>
![12.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/12.png)

---

다음과 같이 아까 설정 및 만들어 둔 Security Group 및 Key Pair를 지정한다. 그러면 아까 지정한대로 외부에서 80포트 및 22포트를 통해 HTTP 요청 및 SSH 접속을 할 수 있다. SSH 접속을 할 때는 Key Pair 생성시 다운로드 받은 .pem 파일을 통해 접속한다.

<br>
![13.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/13.png)

---

인스턴스를 생성하고 나면 다음과 같이 인스턴스들의 상태를 확인할 수 있다.

<br>
![14.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/14.png)

---

인스턴스 생성 확인 후, 외부에서 해당 인스턴스에 접속하기 위해 미리 추가해둔 Floating IP를 연결한다. 다음과 같이 Floating IP 메뉴에서 특정 인스턴스와 IP를 매핑시킬 수 있다.

<br>
![15.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/15.png)

<br>
![16.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/16.png)

위와 같이 ssh를 통해 어떻게 접속하는지 안내를 보여준다. 이제 다음과 같이 Key Pair를 가지고 서버 인스턴스에 접속한다.

```shell
ssh -i judge.pem ubuntu@IP_ADDRESS
```

---

Judge 시스템 및 서버 설정을 하기에 앞서서, RDS for MySQL 서비스를 통해 만들어두었던 DB 인스턴스에 접속을 할 수 있는지 테스트하였다.

<br>
![17.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/17.png)

---

DB에 이상없이 연결이 되었는 것을 확인 후, 필요한 테이블 생성 후 Judge 시스템을 구축하였다. 다음은 지금까지 작업을 한 결과로 브라우저에서 구축한 Judge 사이트에 접속한 결과이다.

<br>
![18.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/18.png)

---

<br>
### 서버 이미지 생성 - 5. 서버 이미지 생성

이제 지금까지 구축해둔 인스턴스로부터 Auto Scale을 위해 사용할 이미지를 생성한다. Auto Scale 진행시 이 서버 이미지를 통해 서버를 생성하여 서비스할 것이다.

이미지를 만들기 위해서는 먼저 해당 인스턴스를 shutdown 해야 한다. Shutdown 시킨 후, Image 메뉴에서 인스턴스로부터 이미지를 생성할 수 있다.

<br>
![19.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/19.png)

이미지를 생성하면 상태가 **"Queued"** 상태인 것을 확인할 수 있는데, 인스턴스로부터 이미지를 생성하는 중으로 **"Active"** 상태가 될 때까지 기다려야 한다.

---

<br>
### Auto Scale 설정 - 1. Load Balancer 설정

Auto Scale 설정의 처음 작업으로 Load Balancer를 설정해야 한다. Auto Scale을 진행하면 여러 대의 서버로 사용자들의 요청을 고르게 분배할 필요가 있다. TOAST에서는 이를 위해 Load Balancer 라는 기능을 제공한다.

VPC에서 Load Balancer를 다음과 같이 생성한다.

<br>
![20.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/20.png)

위의 그림을 보면 알 수 있겠지만, 네트워크 요청에 대해서 어떻게 서버들로 분배할 것인지 지정할 수 있고 health check 기능도 제공하는 것을 알 수 있다. Auto Scale의 Scaling Group에서 이 Load Balancer를 선택할 것이므로 Instance registration에서 인스턴스는 추가하지 않고, HTTP 요청을 분배해야 하므로 80포트를 지정하였다.

그리고 다음과 같이 Floating IP를 아까 추가한 Load Balancer에 연결한다.

<br>
![21.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/21.png)

---

<br>
### Auto Scale 설정 - 2. 인스턴스 템플릿 생성

인스턴스 템플릿을 생성하는 것은 어렵지 않다. 아까 미리 생성해둔 이미지를 선택하고, 인스턴스를 만들 때처럼 Key Pair 및 Security Group을 설정하면 된다.

<br>
![22.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/22.png)

그럼 다음과 같이 인스턴스 템플릿이 생성되는 것을 확인할 수 있다.

<br>
![23.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/23.png)

---

<br>
### Auto Scale 설정 - 3. Scaling Group 설정

이제 Scaling Group 설정을 통해, 자원 사용율에 따라 자동으로 scale in / out 되는 서버들을 사용할 수 있다.
Scaling Group 생성시 서버 인스턴스의 최소 / 최대 개수 및 scale in / out 되는 조건을 지정할 수 있다.

다음과 같이 최소 / 최대 인스턴스 개수 및 Scaling Group 시작시 실행 될 인스턴스 개수를 지정한다. 여기서는 최소 3개 / 최대 10개까지의 서버들이 생성될 것이다.

<br>
![24.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/24.png)

다음으로 scale in / out 조건을 지정한다. CPU 사용율 뿐만 아니라 메모리 사용량, Disk I/O, 네트워크 bandwidth 등을 지정할 수 있다. Judge 사이트는 CPU 사용율에 따라 scale in / out 할 것이므로 다음과 같이 CPU 사용율에 따라 서버 수를 조정하도록 한다. CPU 사용율이 85%가 넘어가면 인스턴스를 새로 생성하도록 하고, 30% 이하일 경우에는 인스턴스를 삭제하도록 지정하였다.

<br>
![25.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/25.png)

마지막으로 아까 생성해둔 Load Balancer를 지정한다. 그럼 Load Balancer는 Scaling Group에 의해 생성되는 서버들로 요청들을 분배할 것이다.

<br>
![26.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/26.png)

Scaling Group을 생성하면 자동으로 서버 인스턴스들이 생성되어 시작된다.

<br>
![27.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/27.png)

---

<br>
### Auto Scale 설정 - 4. Monitoring

이렇게 생성된 서버들은 Monitoring 메뉴에서 상태를 확인할 수 있다. 그림과 같이 CPU / Memory와 같은 사용율 및 status 등을 표 및 그래프로 확인할 수 있다.

<br>
![29.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/29.png)

---

<br>
## **Auto Scale 테스트**

이제 생성된 인스턴스들에 대해 Auto Scaling이 제대로 되는지, Load Balancer는 요청을 분배하는지 테스트 진행하였다.

<br>
### Load Balancer 테스트

지금 생성한 서버 인스턴스들은 아까 생성해두었던 Load Balancer와 연결되어 있다. 그리고 Load Balancer를 생성했을 때 80 포트를 지정해두었으므로 Load Balancer로 HTTP 요청시 각 서버로 요청이 고르게 분배되어야 한다.

브라우저로 Load Balancer IP로 접속했을 때, 각 인스턴스에 대해 제대로 요청이 가는지 nginx log를 통해 확인하였다.

<br>
![28.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/28.png)

위의 그림을 보면 알 수 있겠지만 Load Balancer에 의해 health check도 진행되고 있는 것을 확인할 수 있다.

<br>
### Scale In / Out 테스트

각 서버로 과부하를 걸어 미리 지정한 CPU 사용율을 넘을 경우 새로 인스턴스를 생성하는지 확인하였다.
아까 구축한 Judge 사이트를 통해 알고리즘 문제 제출을 많이 요청하도록 하여 CPU 사용량에 따라 Scale In 되는지 확인하였다.

<br>
![30.png](/static/assets/img/blog/web/2018-03-26-toast_postscript/30.png)

Scaling Group에서 미리 지정한 조건들에 의해 생성된 인스턴스들을 확인할 수 있으며, 구축한 Judge 사이트에 많은 사용자들의 요청이 들어오면 서버 자원 사용율에 따라 자동으로 Auto Scaling이 진행되는 것을 예상할 수 있다.

<br>
## **사용 후기**

TOAST 클라우드에서 제공하는 인프라 서비스를 통해 내가 구축하고자 하는 사이트의 용도에 맞게 쉽게 설정할 수 있었다. 콘솔에서 서버 인스턴스에 대한 포괄적인 제어권을 제공하며, 간단한 Auto Scale 설정을 통해 컴퓨팅 요구 사항 변화에 따라, 내가 신경 쓸 필요없이 자동으로 서버 자원을 확장하거나 축소할 수 있었다.