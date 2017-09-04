---
layout: post
title:  "Http 상태코드"
date:   2017-01-01
desc: "Http 상태코드"
keywords: "java, web, server programming"
categories: [Web]
tags: [java, web, server programming]
icon: icon-html
---

# HTTP 상태코드

## 상태코드의 역할

클라이언트가 서버를 향해 request를 보낼 때 서버에서 그 request를 어떻게 처리하였는지 알려주는 것이다.
가령 다음과 같이 클라이언트가 **GET** 메소드를 통해 request를 보내면 서버가 response의 **첫 번째 줄**에 HTTP 버전과 더불어, 처리 결과에 대한 상태 코드를 보내준다.

---
![00.png](/static/assets/img/blog/web/2017-01-01-http_status_code/00.png)

위에 예에서 **GET /monitor/l7check HTTP/1.1** 를 하였을 때, **HTTP/1.1 200** 과 같이 200이라는 상태코드를 보내준다.

---

## 상태코드 클래스

상태 코드는 **200 OK** 와 같이 3자리 숫자와 설명으로 나타난다.
3자리 숫자에서 첫 번째 자리는 해당 response의 클래스를 나타낸다.

| -- | 클래스 | 설명 |
| ---------- | :--------- | --------- |
| 1xx | Informational | Request를 받아들여 처리중 |
| 2xx | Success | Request를 정상적으로 처리하였음 |
| 3xx | Redirection | Request를 완료하기 위해 추가 동작이 필요하다. |
| 4xx | Client Error | 클라이언트의 오류로 인해 서버는 Request를 처리할 수 없음 |
| 5xx | Server Error | 서버 측의 에러로 인해 Request 처리 실패 |

> HTTP 상태 코드는 RFC2616 및 WebDAV(RFC4918, 5842) / Additional HTTP Status Code (RFC6585) 등에 정의된 것을 보면 60 종류가 넘지만 실제로 자주 사용되는 것은 일부분이다.

## 1xx, Informational

참고 정보로 서버가 클라이언트의 Request가 접수되었고 현재 처리하고 있다는 의미이다.
HTTP/1.0 이후로 정의되지 않았다. 서버들도 클라이언트에게 보통 이 코드를 보내지는 않는다.

### 100, Continue

요청된 초기 Request는 접수되었고 클라이언트는 계속해서 Request를 보낼 수 있다는 것이다. 클라이언트는 전체 Request의 나머지 부분도 전송해야하며, 완료되었다면 이 응답을 무시해야 한다.

### 101, Switching Protocols

서버는 **Upgrade** 헤더 필드에 명시된 프로토콜로 교환하기 위한 클라이언트 Request 에 따르고 있다는 것을 의미한다. 보통 이 상태코드는 다음과 같이 **WebSocket을 사용할 때 많이 사용한다.**

---
#### WebSocket Protocol

**WebSocket은 클라이언트와 서버 사이에 지속적이고 완전한 양방향 연결 스트림을 만들어주는 기술이다.**

WebSocket은 2011년 [RFC6455](https://tools.ietf.org/html/rfc6455)에 의해 표준화된 것으로, 연결을 유지하지 않고 실시한 상호작용성이 떨어지는 HTTP 프로토콜의 단점을 개선하기 위해 만들어진 규약이다. WebSocket은 HTTP를 기반으로 하면서도 HTTP의 문제점을 해결하는 것을 목표로 하고 있다.

이 WebSocket의 프로토콜은 HTTP를 기반으로 하지만 HTTP 프로토콜과는 전혀 다른 프로토콜이다. HTTP를 기반으로 한다는 의미는 WebSocket 연결을 맺는 과정에서 HTTP가 개입한다는 의미이다.

먼저 HTTP 프로토콜을 통해 WebSocket을 사용할 수 있는지, 클라이언트가 서버에게 묻는데 서버가 WebSocket을 지원하면 이 때 **101 상태코드를 통해 protocol switching** 을 하겠다고 응답한다. 이 후 클라이언트와 서버사이에는 WebSocket 프로토콜을 통해 통신하게 된다. (WebSocket Handshake)

* WebSocket Handshake
<br>
![01.png](/static/assets/img/blog/web/2017-01-01-http_status_code/01.png)

* 다음과 같이 **101 상태코드를 통해** WebSocket Handshake 과정에서 처음 HTTP 프로토콜을 통해 WebSocket 사용 가능 여부를 묻고 응답하게 된다.

~~~
GET /mychat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat
Sec-WebSocket-Version: 13
Origin: http://example.com
~~~
~~~
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
~~~

---


## 2xx, Success

서버가 Request를 성공적으로 수신하였고 이해했으며, 정상적으로 처리하였다는 의미이다. 사실 200과 206을 제외하고는 볼 일이 거의 없다.

### 200 OK

서버가 Request를 정상적으로 처리하였다는 의미이며 가장 일반적으로 볼 수 있는 HTTP 상태코드이다.
이 상태코드와 함께 추가적으로 오는 정보는 HTTP Request 메소드에 따라 다르다.

### 201 Created

서버에서 새로운 URI가 만들어질 때마다 사용되며 이 상태코드와 함께, 새로운 데이터가 위치한 곳을 Location 헤더에 포함하여 보내준다.

서버는 201 상태코드를 보내주기 전에 반드시 새로운 URI에 해당하는 리소스를 서버에 생성해두어야 한다. 만약 리소스를 즉각적으로 만들 수 없다면, **202 accepted** 로 보내주어야 한다.

### 202 Accepted

클라이언트의 Request를 받아들이기는 했는데, 아직 처리가 완료되지 않았음을 나타낸다.
그런데 이 Request에 대한 처리는 처리될 수도 있고, 처리되지 않을 수도 있다.

이 상태코드의 궁극적인 목표는 서버가 클라이언트에 대한 Request 처리를 즉각적으로 완료할 수 없을 때, 먼저 이 상태코드를 보내고 다른 Request를 수신하기 위함이다.

이 상태코드와 함께 해당 Request에 대한 처리를 언제 완료할 수 있는지에 대한 예상 완료시간, 현재 상태를 함께 보내주어야 한다.

### 204 No Content

서버가 Request를 처리하는 것은 성공했는데, Response를 보낼 때 주어지는 헤더나 바디 내용이 없다는 뜻이다.
새로운 내용이 없으므로 웹 브라우저에게 이전 페이지를 계속해서 보여주라고 알려주는 것이다.

### 205 Reset Content

새로운 문서가 없더라도 브라우저에서 화면을 초기화하고 문서를 새로 표시한다는 것이다.
이 상태코드는 주로 사용자 입력을 받는 폼이 있는 웹 페이지에 대해 유용하다. 사용자 입력을 받고, 그 폼의 내용을 지워 다른 입력을 또 받고자할 때 사용할 수 있다.

### 206 Partial Content

이 상태코드는 Range 헤더에 의해 범위가 지정된 Request에 대해 서버가 받았음을 나타낸다. Response에는 Content-Range 헤더를 포함해야 한다.


## 3xx, Redirect

3xx 대의 상태코드는 Request를 정상적으로 처리하기 위해 클라이언트 측에서 특별한 처리를 수행해야 함을 나타낸다.

### 300, Multiple Choices

요청한 리소스가 여러 곳에 있을 때 어떠한 리소스를 원하는지를 서버가 묻는 것이다.


### 301, Moved Permanently

요청된 리소스의 위치가 영구적으로 변했음을 나타낸다. 이후에는 실제 변경된 URI를 사용해야 된다는 것을 나타낸다.
변경된 URI는 Response의 Location 필드를 통해 알 수 있다.

### 302 Found

요청된 URI는 일시적으로 새로운 URI를 가진다. 301과 비슷하지만 변경된 URI는 일시적인 것으로, 다시 원래대로의 URI를 가질 수 있다. 클라이언트는 이 응답을 받자마자 Request를 완전히 처리하기 위해 새로운 URI를 사용해야 한다.

### 303 See Other

이 상태코드는 리소스가 다른 URI에 있는데, **GET 메소드** 를 통해 얻어야 한다는 것을 강조한다. 302 Found와 같은 기능인데 다른 URI에 대한 Request를 보낼 때 **GET 메소드**를 사용해야 된다는 것을 명확히 한다.

주로 POST 메소드를 통해 엑세스한 CGI 프로그램의 처리 결과를 별도의 URI를 통해 받게할 때 303을 사용한다.

> 301, 302, 303 상태코드에 대해서 대부분의 브라우저는 GET 메소드를 통해 변경된 URI에 대해 다시 재송신하도록 되어 있다. 301, 302의 사양은 POST 메소드를 GET 메소드로 바꾸는 것을 금지하고 있지만 대부분의 브라우저는 이렇게 구현되어 있다.

### 304, Not Modified

클라이언트가 조건부 Request를 보냈을 때 리소스에 대한 엑세스는 허락하지만 조건이 충족되지 않았다는 것을 의미한다.
**If-Since-Modified** 헤더에 시간을 설정하고 클라이언트가 Request를 보내면 서버는 그 시간 이후로 해당 리소스의 변경이 없다면 304 상태코드만 보내고 리소스의 내용은 보내주지 않는다.

### 305, Use Proxy

리소스를 프록시를 통해서만 받으라는 의미이다. Response의 Location 필드에 프록시 URI가 명시되어 있으며 이 후에 이 프록시 URI를 통해 접근해야 한다.

### 307, Temporary Redirect

요청된 리소스의 URI가 일시적으로 옮겨졌다는 것으로 302와 비슷한데 307의 경우에는 브라우저 사양에 따라 POST 메소드에 대해 GET으로 치환하지 않는다.

## 4xx, Client Error

이 상태코드들은 클라이언트의 원인으로 에러가 발생했음을 나타낸다.

### 400, Bad Request

클라이언트가 보낸 Request 문법이 잘못되었다는 것을 나타낸다. 이 에러가 발생한 경우, 클라이언트 측에서는 Request를 재검토 후 재송신할 필요가 있다.

### 401, Unauthorized

인증이 필요한 리소스에 대해 인증없이 접근할 경우 발생한다. 이 상태 코드를 사용할 때 서버는 반드시 클라이언트로 어느 인증 방식을 사용할 것인지 WWW-Authenticate 헤더 필드에 포함하여 보내주어야 한다. 단순히 권한이 없다는 403, Forbidden을 사용해야 한다.

클라이언트가 Authorization 헤더 필드에 값을 넣은 채로 Request를 보낸 경우라면, 이 상태코드는 단순히 인증이 거절되었다는 것을 의미한다.


### 402, Payment Required

이 코드는 HTTP 로 구현된 것은 아닌데, 서버의 리소스를 획득하기 위해 추가적인 지불이 필요하다는 것을 나타낸다.

### 403, Forbidden

서버가 리소스에 대한 접근을 거부할 때 사용한다. 이 에러는 서버 자체 또는 서버에 있는 리소스에 대한 접근 권한이 없을 경우 발생하며 이 떄 뜨는 것이 403 에러이다.

### 404, Not Found

해당 리소스가 서버에 없다는 뜻이다. 이 상태 코드는 클라이언트 에러에 해당하는 상태 코드들 중 가장 많이 보게된다. 또한 서버가 Request를 거부하고싶은데 이유를 명시하고 싶지 않는 경우에도 이 것을 사용할 수 있다.

### 405, Method Not Allowed

클라이언트가 해당 리소스에 대해 잘못되었거나 허용되지 않는 메소드를 통해 접근하였을 때 사용하는 상태 코드이다.
Response의 Allow 헤더 필드에는 해당 리소스에 사용할 수 있는 메소드 목록을 포함한다.

### 406, Not Acceptable

요청은 정상이긴한데, 서버에서 받아들일 수 없는 경우에 사용한다.
Spring 에서 오브젝트를 JSON으로 변환해서 보내주는 과정에서 에러가 있으면 이 상태 코드가 발생한다.

[spring-mvc-json-406-not-acceptable](https://stackoverflow.com/questions/16335591/spring-mvc-json-406-not-acceptable)

### 407, Proxy Authentication Required

401과 유사한데, 클라이언트는 프록시에서 인증이 먼저 필요하다는 것을 명시한다. 클라이언트는 프록시 서버에 인증한 후 다시 시도해봐야 한다.

### 408, Request Timeout

클라이언트의 요청이 서버에서 지정한 시간내에 처리하지 못했음을 나타낸다.

## 5xx, Server Error

이 상태 코드들은 서버 측의 에러가 있을 경우 사용하는 코드들이다.

### 500, Internal Server Error

서버에서 오류가 발생하 작업을 수행할 수 없을 경우에 볼 수 있다. HTTP Request에 대한 리소스가 JSP, PHP, 서블릿등과 같은 프로그램일 경우 루틴이 동작하다가 에러가 발생할 경우 이 상태코드를 보낸다.

**서버 개발자는 오류에 대한 내용, 즉 프로그램 언어, Exception 내용, 웹 서버의 종류 등이 클라이언트로 노출되지 않도록 해야한다.**

### 501, Not Implemented

클라이언트의 Request를 서버가 수행할 없음을 나타낸다.

### 502, Bad Gateway

게이트웨이가 잘못된 프로토콜을 통해 연결하거나 프로토콜에 문제가 있어 통신이 제대로 되지 않았을 경우에 사용한다.
보통 서버에 과부하가 걸려있거나 네트워크가 잘못된 연결을 했을 경우에 발생한다.

### 503, Service Temporarily Unavailable

해당 리소스를 사용할 수는 없지만, 앞으로 복구된다는 의미이다. 보통 서버가 유지보수 중이거나 터졌을 때 발생하며, Retry-After 헤더 필드를 Response 에 포함하여 보냄으로써 클라이언트가 언제부터 다시 리소스를 사용할 수 있는지 알 수 있게 할 수 있다. 만약, 이 필드가 없다면 클라이언트는 500 에러처럼 처리해야 한다.

### 504, Gateway Timeout

클라이언트와 오리진 서버사이에 프록시 서버나 게이트웨이가 있을 때 이 서버가 오리진 서버로부터 정해진 시간내에 Response를 받지 못했을 경우에 사용한다.

### 505, HTTP Version Not Supported

서버가 Request에 사용된 HTTP Version을 지원하지 않을 경우에 사용한다. 웬만해서는 볼 수 없다.
