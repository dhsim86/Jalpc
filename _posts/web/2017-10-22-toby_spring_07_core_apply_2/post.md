---
layout: post
title:  "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.2"
date:   2017-10-22
desc: "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.2"
keywords: "spring, toby spring, jaxb"
categories: [Web]
tags: [spring]
icon: icon-html
---

## 서비스 추상화 적용

다음과 같이 구현된 "JaxbXmlSqlReader" 클래스는 좀 더 개선하고 발전시킬 부분이 있다.
~~~java
public class JaxbXmlSqlReader implements SqlReader {

  private static final String DEFAULT_SQLMAP_FILE = "/sql/sqlmap.xml";
  private String sqlMapFile = DEFAULT_SQLMAP_FILE;

  public void setSqlMapFile(String sqlMapFile) {
    this.sqlMapFile = sqlMapFile;
  }

  @Override
  public void read(SqlRegistry sqlRegistry) {
    String contextPath = Sqlmap.class.getPackage().getName();

    try {
      JAXBContext context = JAXBContext.newInstance(contextPath);
      Unmarshaller unmarshaller = context.createUnmarshaller();
      InputStream inputStream = UserDao.class.getResourceAsStream(sqlMapFile);
      Sqlmap sqlmap = (Sqlmap)unmarshaller.unmarshal(inputStream);

      for (SqlType sql : sqlmap.getSql()) {
        sqlRegistry.registerSql(sql.getKey(), sql.getValue());
      }

    } catch (JAXBException e) {
      throw new RuntimeException(e);
    }
  }
}
~~~

* 자바는 JAXB 말고도 다양한 XML과 오브젝트를 매핑하는 기술이 있다. 따라서 필요에 따라 다른 기술로 손쉽게 바꾸어서 사용할 수 있게 해야 한다.
* XML 파일을 좀 더 다양한 소스에서 가져올 수 있도록 할 필요가 있다. 위 코드는 미리 정해진 경로에서만 읽을 수 있지만, 이 것을 임의의 클래스패스나 파일 시스템 상의 절대 위치와 같이 다양한 곳에서 리소스를 읽을 수 있도록 할 필요가 있다.

<br>
### OXM 서비스 추상화

JAXB가 비록 JavaSE 와 JavaEE 표준에 포함되어 있긴 하지만 이 말고도 실전에서 자주 사용되는 다양한 XML-오브젝트 매핑 기술이 있다. (Castor XML, JiBX, XmlBeans, Xstream)

이렇게 XML과 자바 오브젝트를 매핑해서 상호 변환해주는 기술을 간단히 OXM(Object-XML Mapping) 이라고 하는데, OXM 프레임워크와 기술들은 사용 목적이 동일해서 유사한 기능과 API를 제공한다.

다양한 OXM 프레임워크 및 기술을 지원하기 위해, **로우레벨의 구체적인 기술과 API에 종속되지 않는 추상화된 레이어와 API를 제공하여 구현 기술에 대해 독립적인 코드를 작성할 수 있도록 해주는 서비스 추상화가 필요하다.**

스프링은 트랜잭션 뿐만 아니라, OXM에 대해서도 서비스 추상화 기능을 제공한다. 스프링이 제공하는 OXM 추상 레이어의 API를 이용해 XML 문서와 오브젝트사이의 변환을 처리하면 OXM 기술을 자유롭게 바꾸어서 사용할 수 있다.

다음 코드는 스프링이 제공하는 OXM 추상화 인터페이스 중 XML 을 자바 오브젝트로 변환하는 **Unmarshaller** 이다.

~~~java
package org.springframework.oxm;

import javax.xml.transform.Source;

// XML 파일에 대한 정보를 담은 Source 타입의 오브젝트를 넘겨주면 설정에서 지정한 OXM 기술에 따라 자바 오브젝트 트리로 변환해준다.
public interface Unmarshaller {
  boolean supports(Class<?> clazz);

  // source를 통해 제공받은 XML을 자바 오브젝트 트리로 변환하여 루트 오브젝트를 리턴
  // 매핑 실패할 때 추상화된 예외를 던진다.
  Object unmarshal(Source source) throws IOException, XmlMappingException;
}
~~~

[Spring OXM abstraction layer test](https://github.com/dhsim86/tobys_spring_study/commit/f6c2f2accdae7f81a71498ff66fe0ef22c12138f)
<br>
[Implemented OxmSqlService using spring oxm abstraction layer.](https://github.com/dhsim86/tobys_spring_study/commit/6eaf6dbbf108a6261f10ae5f49ae910ccfd2500f)

<br>
### 리소스 추상화

OxmSqlReader 든, XmlSqlReader 든 공통적인 문제점이 있는데 다음과 같이 SQL 매핑 정보가 담긴 XML 파일을 읽으므로, 다양한 곳 (즉 파일시스템의 특정 폴더나 해당 파일이 원격에 있을 때)에 있는 XML 파일에 대해서는 지정할 수 없다는 것이 문제다.

~~~java
Source source = new StreamSource(getClass().getResourceAsStream(sqlMapFile));
~~~

위와 같이 구현되어 있기 때문에 파일 시스템이나 웹 상의 HTTP 접근을 통해 읽으려면 **URL** 클래스를 사용해야 한다. 또한 서블릿 컨텍스트 내의 리소스를 가져오려면 **ServletContext의 getResourceAsStream** 을 사용해야 한다. 문제는 리소스의 위치나 종류에 따라서 다른 클래스나 메소드를 사용해야 한다는 것이다.

이것도 마찬가지로 리소스를 읽어야한다는 목적은 동일하지만 각기 다른 기술이 존재하는 것으로 이해할 수 있다. 따라서 리소스를 읽는 방법(기술)에 대해서도 서비스 추상화를 적용할 수 있다고 볼 수 있다.

스프링은 자바에 존재하는 **일관성없는** 리소스 접근 API를 추상화해서 **Resource** 라는 추상화 인터페이스를 정의하였다.

~~~java
public interface Resource extends InputStreamSource {
  // 리소스의 존재나 읽기 가능한지 여부를 확인할 수 있다.
  boolean exists();
  boolean isReadable();
  boolean isOpen();

  URL getURL() throws IOException;
  URI getURI() throws IOException;
  File getFile() throws IOException;

  Resource createRelative(String relativePath) throws IOException;

  long lastModified() throws IOException;
  String getFilename();
  String getDescription();
}

public interface InputStreamSource {
  InputStream getInputStream() throws IOException;
}
~~~

~~~java
private Object getMockedAnswer(DateTime targetTime) throws Throwable {

  Gson gson = new Gson();

  Resource resource = applicationContext.getResource(meterConfig.getMockAnswer());
  JsonReader reader = new JsonReader(new InputStreamReader(resource.getInputStream()));

  BillingResponseBean billingResponseBean = gson.fromJson(reader, type);

  List<BillingMeterResponseBean> billingMeterResponseBeanList = billingResponseBean.getMeterList();

  billingMeterResponseBeanList.forEach(billingMeterResponseBean -> {
    billingMeterResponseBean.setTimestamp(getSharpTime(targetTime));
  });

  return billingResponseBean;
}
~~~

스프링의 거의 모든 API는 외부의 리소스 정보가 필요할 때는 항상 이 Resource 추상화 인터페이스를 사용한다. 그런데 다른 빈들처럼 애플리케이션 컨텍스트에 빈 등록해서 사용하는 것이 아니라, 일반적인 java.io 의 Reader나 InputStream 처럼 값으로 사용한다.

따라서 **추상화를 적용할 때는 빈 등록할 때처럼 구현 클래스를 지정하는 것이 아니라, 프로퍼티에 일정한 규칙을 갖는 접두어를 설정한다.**

스프링에는 URL 클래스와 비슷하게 접두어를 이용하여 Resource 오브젝트를 선언하는 방법이 있다. 다음과 같이 location String 파라미터에 **리소스의 종류와 리소스의 위치를 함께 표현** 하면 Resource 타입의 오브젝트로 변환해주는 **ResourceLoader** 를 사용하는 것이다.

~~~java
package org.springframework.core.io;

public interface ResourceLoader {
  // location에 담긴 정보를 바탕으로 그에 적절한 Resource로 변환해준다.
  Resource getResource(String location);
}
~~~

다음 표는 ResourceLoader가 인식하는 접두어와 이를 이용해 리소스를 표현한 예를 나타낸 것이다.

| 접두어 | 예 | 설명 |
| ---------- | :--------- | :---------- |
| file: | file:/C:/temp/file.txt | 파일 시스템의 C:/temp 폴더에 있는 file.txt를 Resource로 만들어준다. |
| classpath: | classpath:file.txt | 클래스패스의 루트에 있는 file.txt에 접근할 수 있도록 한다. |
| 없음 | WEB-INF/test.dat | 접두어가 없는 경우, ResourceLoader의 구현에 따라 리소스의 위치가 결정된다. ServletResourceLoader 이면 서블릿 컨텍스트의 루트를 기준으로 해석한다. |
| http: | http://www.myserver.com/test.dat | HTTP 프로토콜을 사용해서 접근할 수 있는 웹상의 리소스를 지정한다. ftp도 사용가능하다.|

> 접두어를 붙이면 ResourceLoader의 구현에는 상관없이 접두어가 의미하는 위치와 방법을 이용해 리소스를 읽어온다.

ResourceLoader의 대표적인 예는 스프링의 애플리케이션 컨텍스트이다. 애플리케이션 컨텍스트가 구현하는 인터페이스인 **ApplicationContext 는 ResourceLoader를 상속받는다.** 스프링 컨테이너는 설정정보가 담긴 XML 파일도 ResourceLoader를 통해 Resource 형태로 읽어온다.

또한 애플리케이션 컨텍스트가 외부에서 읽어오는 모든 정보는 ResourceLoader를 사용한다. 빈 프로퍼티 설정시, 프로퍼티가 Resource 타입일 때, 이 타입으로 별도 빈을 등록하지 않고 문자열 형태로 설정한다.

~~~xml
<property name="file0" value="classpath:/file.txt" />
<property name="file1" value="file:/data/file.txt" />
<property name="file2" value="http://www.myserver.com/file.txt" />
~~~

위와 같이 문자열로 된 리소스 정보를 Resource 오브젝트로 변환해서 프로퍼티에 주입할 때, **애플리케이션 컨텍스트 자신이 ResourceLoader로서 변환과 로딩기능을 담당한다.** 따라서 빈 입장에서는 추상화된 Resource 타입의 오브젝트를 주입받으므로 리소스가 어떤 종류인지 상관없이 동일한 방법으로 리소스를 읽을 수 있다.

Resource 타입은 다음과 같이 실제 리소스가 어떤 것이든 상관없이, getInputStream() 메소드를 통해 스트림으로 가져올 수 있다.

~~~java
InputStreamReader inputStreamReader = new InputStreamReader(resource.getInputStream());
~~~

이렇게 스프링의 리소스 추상화를 이용해서 리소스의 위치나 접근 방법에 독립적인 코드를 쉽게 만들 수 있다.

[Use Resource class for resource abstraction.](https://github.com/dhsim86/tobys_spring_study/commit/d5c2b6651f9f57523156815ae2bd98d7e5e8be38)

> Resource 를 사용할 때는, Resource 오브젝트가 실제 리소스는 아니라는 점을 주의해야 한다. 단지 리소스에 접근할 수 있는 추상적인 핸들러일 뿐이다. 따라서 Resource 오브젝트가 만들어졌다 하더라도, 실제 리소스가 존재하지 않을 수 있다.

<br>
## 인터페이스 상속을 통한 안전한 기능확장

지금까지 적용해왔던 DI 는 특별한 기술이라기보다는 디자인 패턴 또는 프로그래밍 모델이라는 관점에서 이해하는 것이 자연스럽다. 스프링같은 DI 프레임워크를 적용하고 빈 설정파일을 통해 애플리케이션을 구성했다고 해서 DI를 올바르게 활용하고 있다고 볼 수는 없다. **DI의 가치를 제대로 얻으려면 먼저 DI에 적합한 오브젝트 설계가 필요하다.**

<br>
### DI를 의식하는 설계

DI에 필요한 유연하고 확장성이 뛰어난 오브젝트 설계를 하려면 많은 고민과 학습, 훈련, 경험이 필요하다. 이를 위해 **DI를 의식하면서 오브젝트를 설계해나가야 한다.**

**적절한 책임에 따라 오브젝트를 분리하고, 항상 의존 오브젝트는 자유롭게 확장될 수 있다는 점을 염두에 두어야 한다.** 또한 DI는 런타임 시에 의존 오브젝트를 다이내믹하게 연결하여 유연한 확장을 꾀하는 것이 목적이므로, 항상 확장을 염두에 두고 오브젝트 사이의 관계를 생각해야 한다.

<br>
### DI와 인터페이스 프로그래밍

DI를 적용할 때는 가능한 **인터페이스를 사용해야 한다.** 두 오브젝트 간의 느슨한 결합을 위해 인터페이스를 통해 연결해야 한다.

인터페이스를 사용하는 첫 번째 이유는 **다형성** 을 얻기 위해서이다. DI 적용 예를 보면 구현 클래스를 바꿔가면서 쓸 뿐만 아니라, 프록시 / 데코레이터 / 어댑터 / 테스트 mock 등의 다양한 목적을 위해 인터페이스를 통한 다형성이 활용된다.

인터페이스를 사용하는 또 다른 이유는 인터페이스 분리 원칙을 통해 **클라이언트와 의존 오브젝트 사이의 관계를 명확히 할 수 있기 때문이다.**

하나의 오브젝트가 여러 인터페이스를 구현할 수 있는데, 이는 **각기 다른 관심과 목적을 가지고 있는 클라이언트들이 한 오브젝트를 바라볼 때도 있다는 것이다.** 어느 특정 클라이언트는 특정 인터페이스에 대해서만 관심을 가지고 있지, 그 오브젝트가 구현한 다른 인터페이스에 대해서는 관심이 없을 수 있다. 이 때 이 클라이언트에게는 관심이 없는 인터페이스의 메소드는 노출시킬 필요가 없다.

~~~java
public interface A {
  ...
}

public interface B {
  ...
}

public class object implements A, B {
  ...
}

// 이 클라이언트는 A 인터페이스에만 관심이 있다.
public class Client0 {
  private A object;
  ...
}

// 이 클라이언트는 B 인터페이스에만 관심이 있다.
public class Client1 {
  private B object;
  ...
}
~~~

오브젝트가 응집도 높게 설계되었다하더라도, 목적과 관심이 각기 다른 클라이언트가 있다면 인터페이스를 통해 이를 적절하게 분리해줄 필요가 있다. 이를 **인터페이스 분리 원칙** 이라고 한다. 만약 인터페이스를 사용하지 않고 **클래스를 직접 참조하게 하였다면, 인터페이스 분리 원칙과 같은 클라이언트에 특화된 의존관계를 만들 방법이 없다.**

>  인터페이스 분리 원칙은 **클라이언트의 목적과 용도에 적합한 인터페이스만을 제공한다는 것이다.**

인터페이스 분리 원칙이 주는 장점은 **모든 클라이언트가 자신의 관심에 따른 접근 방식을 불필요한 간섭없이 유지할 수 있다는 점이다.** 따라서 변경이 필요할 때 기존 클라이언트에 영향을 주지 않는 채로 오브젝트의 기능을 확장하거나 추가할 수 있다.

만약 의존 오브젝트가 확장되어, 기존 클라이언트에서는 **관심이 없는 기능** 을 추가하고자 할 때 의존 오브젝트의 인터페이스를 바로 수정하는 것은 바람직한 것이 아니다. **추가되는 기능을 사용해야하는 다른 클라이언트만이 사용할 수 있도록 인터페이스를 상속받거나 다른 인터페이스를 추가로 구현하여 유연한 확장을 해야 한다.**

<br>
## DI를 이용해 다양한 구현 방법 적용

구현된 SqlRegistry 의 인터페이스를 확장하여, SQL 조회 뿐만 아니라 운영 중에 메모리 상에 로드된 SQL 구문을 변경할 수 있는 인터페이스를 만든다.

운영 중인 서버 시스템에서 정보를 실시간으로 변경하는 작업을 구현할 때 가장 먼저 고려해야할 것은 **동시성 문제** 이다. 한 번 초기화하고 읽기만 하는 일반적인 데이터는 동시성 문제는 없지만, 만약 수정을 가할 때 동시성 문제가 발생한다.

<br>
### ConcurrentHashMap 사용

만약 데이터가 Collection 일 경우, **Collections.synchronizedMap()** 을 통해 동기화를 해줄 수 있지만 성능에 문제가 생긴다. 따라서 HashMap 일 경우, 동기화된 해시 데이터 조작에 최적화된 **ConcurrentHashMap** 을 사용하는 것이 권장된다. 이 Collection은 데이터 조작시 전체 데이터에 대해서는 락을 걸지 않고, 조회시에는 아예 락을 걸지 않는다. 따라서 어느 정도 동시성 문제를 해결하면서 성능이 보장되는 동기화된 HashMap으로 사용하기에 적절하다.

[Implemented ConcurrentHashMapSqlRegistry.](https://github.com/dhsim86/tobys_spring_study/commit/310dd7fb0d36736b809c23f5f55d9ef1e4eb936f)

<br>
### 내장 DB 사용

ConcurrentHashMap이 멀티스레드 환경에서 최소한의 동시성을 보장하고 성능도 나쁜 편은 아니지만, 저장되는 데이터의 양이 많고 자주 변경과 조회가 일어난다면 한계가 있다.

**인덱스를 활용한 최적화된 검색을 지원하고 동시에 많은 요청을 처리하면서 안정적인 변경작업이 가능한 기술은 데이터베이스이다.** 그런데 DAO가 사용할 SQL을 저장하고 관리할 목적으로 별도의 DB를 구성하는 것보다는 번거로움없이 사용가능한 내장형 DB를 사용하는 것이 좋다.

> 내장형 DB란 애플리케이션에 내장되어서 애플리케이션과 함께 시작하고 종료되는 DB를 말한다. 데이터는 메모리에 저장되어 IO로 인한 부하는 적다. 메모리에 컬렉션이나 오브젝트를 활용하여 데이터를 저장하는 것보다 매우 효과적으로 등록, 수정, 검색이 가능하며 격리수준, 트랜잭션, 최적화된 락킹을 적용할 수도 있다. 메모리로 읽은 데이터를 여러 가지 조건으로 검색하거나 통계를 내야하고, 조작하면서 복잡한 로직을 처리할 경우 내장형 DB를 활용하면 매우 편하게 작업을 진행할 수 있다.

자바에서 많이 사용되는 내장형 DB는 **Derby, HSQL, H2** 를 꼽을 수 있다. 모두 JDBC 드라이버를 제공하며 표준 DB와 호환되므로 JDBC 프로그래밍 모델을 그대로 따라서 사용할 수 있다.

애플리케이션과 생명주기를 같이하는 내장형 DB를 사용하기 위해서는 **DB를 구동시키고 초기화 SQL 스크립트를 실행시키는 별도의 초기화작업이 필요하다.** 일단 DB를 초기화하고 난 다음에는, 내장형 DB용 JDBC 드라이버를 통해 사용할 수 있다.

스프링은 내장형 DB를 쉽게 사용할 수 있도록 내장형 DB를 위한 서비스 추상화 기능을 제공한다. 내장형 DB를 초기화하기 위한 작업을 지원하는 **내장형 DB 빌더** 를 제공하는데, 필요한 DB 접속 URL과 드라이버 등을 초기화해준다. 그리고 데이터 초기화를 위해 테이블 등을 생성하거나 초기 데이터를 삽입해주는 SQL을 실행하기도 한다.

내장형 DB를 사용하기 위해 먼저 필요한 테이블을 생성할 수 있도록 **SQL 스크립트를 준비해야 한다.**

~~~sql
CREATE TABLE SQLMAP (
    KEY_ VARCHAR(100) PRIMARY KEY,
    SQL_ VARCHAR(100) NOT NULL
);
~~~

그리고 만약 초기 데이터가 필요하다면, 만들어진 테이블에 삽입하는 스크립트도 준비해야 한다.

~~~sql
INSERT INTO SQLMAP(KEY_, SQL_) VALUES('KEY1', 'SQL1');
INSERT INTO SQLMAP(KEY_, SQL_) VALUES('KEY2', 'SQL2');
~~~

내장형 DB를 실행시킬 때, 위와 같이 만든 두 개의 스크립트가 실행되어야 한다. 스프링이 제공하는 내장형 DB 빌더는 DB 엔진을 생성하고 초기화 스크립트를 실행해서 테이블과 초기 데이터를 준비한 뒤에 DB에 접근할 수 있는 Connection을 생성해주는 DataSource **(정확히는 shutdown() 메소드가 추가된 EmbeddedDataBase 타입)** 오브젝트르 돌려준다.

~~~java
public interface EmbeddedDatabase extends DataSource {
    void shutdown();
}
~~~

[Embedded DB, HSQLDB Test.](https://github.com/dhsim86/tobys_spring_study/commit/8972740419c75f8c882d0855a1edc34d59315f39)

내장형 DB를 이용하기 위해 **EmbeddedDatabaseBuilder** 를 사용하는데, 보통 이 오브젝트는 한 번 초기화를 거치고 나서 내장형 DB를 구동하면 그 이후로는 사용할 일이 없으므로 빈으로 등록하지 않는다. 보통 이 빌더를 사용해 내장형 DB에 접근할 수 있는 **EmbeddedDatabase** 타입의 오브젝트를 생성해주는 팩토리 빈을 만들어야 한다.

스프링에는 팩토리 빈을 만드는 번거로운 작업을 대신해주는 전용 태그가 있다. 내장형 DB와 관련된 빈을 설정해주고 등록해주는 태그는 **jdbc** 스키마에 정의되어 있다. jdbc 네임스페이스를 정의하고 간단한 전용 태그로 빈을 정의하면 내장형 DB를 쉽게 사용가능하다.

~~~xml
<beans xmlns="http://www.springframework.org/schema/beans"
       ...
       xmlns:jdbc="http://www.springframework.org/schema/jdbc"
       xsi:schemaLocation="...
                http://www.springframework.org/schema/jdbc
                http://www.springframework.org/schema/jdbc/spring-jdbc-4.3.xsd">
...
<jdbc:embedded-database id="embeddedDatabase" type="HSQL" >
    <jdbc:script location="classpath:schema.sql" />
</jdbc:embedded-database>
~~~

위와 같이 설정하면 "embeddedDatabase" 라는 아이디를 가진 빈이 등록되며, 빈의 타입은 EmbeddedDatabase 타입이다. location에 정의한 스키마를 통해 내장형 DB가 초기화될 것이다.

> jdbc 태그에 의해 만들어진 EmbeddedDatabase 타입 빈은 스프링 컨테이너가 종료될 때, 자동으로 shutdown() 메소드가 호출되게 되어 있다.

[EmbeddedDbSqlRegistry Test.](https://github.com/dhsim86/tobys_spring_study/commit/869443f16da8217a07f3ab6fedfefb01fc288f6e)
<br>
[Applied EmbeddedDbSqlRegistry on SqlService.](https://github.com/dhsim86/tobys_spring_study/commit/21f9ccdcad4e0ffe8d09640316da2fa5c6ecf391)

<br>
### 내장형 DB, 트랜잭션 적용

구현된 EmbeddedDbSqlRegistry 는 내장형 DB를 사용하므로, 조회가 빈번하게 일어나는 도중에 업데이트가 일어나더라도 데이터가 깨지는 일은 없다. 그런데 다음과 같이 하나 이상의 SQL 구문을 맵으로 파라미터를 받아 업데이트 하는 다음 메소드는 문제가 생길 수 있다.

~~~java
@Override
public void updateSql(Map<String, String> sqlMap) throws SqlUpdateFailureException {
  for (Map.Entry<String, String> entry : sqlMap.entrySet()) {
    updateSql(entry.getKey(), entry.getValue());
  }
}
~~~

위 메소드는 맵 형식으로 파라미터를 받아, SQL 구문을 하나씩 업데이트하도록 되어 있다. 만약 여러 개의 SQL 구문을 변경하는 도중에 키가 없어 예외가 발생하면 작업이 중단되면, **중단되기 전에 업데이트를 완료한 SQL 구문은 그대로 DB에 반영되어 있게된다.**

보통 운영 중인 시스템에서 여러 SQL 구문을 업데이트하는 경우는 **각 SQL 구문들이 서로 영향이 있기 때문이다.** 따라서 여러 개의 SQL 구문을 변경하는 작업은 반드시 **한 트랜잭션 안에서 일어나야 한다.**

컬랙션으로 SQL 구문을 다룰 경우, 트랜잭션 개념을 적용하기가 힘들다. 여러 개의 엘리먼트를 트랜잭션과 같은 원자성이 보장된 상태에서 변경하려면 매우 복잡한 과정이 필요하기 때문이다. 반면에 내장형 DB의 경우 트랜잭션 적용이 가능하다.

보통 **트랜잭션 매니저는 여러 AOP를 통해 만들어지는 트랜잭션 프록시에서 같은 매니저를 공유해야하므로 싱글톤 빈으로 등록** 하나, 이 경우와 같이 내장형 DB에 대한 트랜잭션 매니저는 공유할 필요가 없다. 간결하게 사용할 수 있도록 트랜잭션 처리 코드로 구현하기 보다는 **TransactionTemplate** 를 사용하여 템플릿 / 콜백 패턴을 적용하는 것이 좋다.

~~~java
public void setDataSource(DataSource dataSource) {
  jdbcTemplate = new JdbcTemplate(dataSource);
  transactionTemplate = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
}

...

@Override
public void updateSql(final Map<String, String> sqlMap) throws SqlUpdateFailureException {
  transactionTemplate.execute(new TransactionCallbackWithoutResult() {
    @Override
    protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {
      for (Map.Entry<String, String> entry : sqlMap.entrySet()) {
        updateSql(entry.getKey(), entry.getValue());
      }
    }
  });
}
~~~

[Applied transaction on multiple sql row update.](https://github.com/dhsim86/tobys_spring_study/commit/6ae652cb2ba975b8a128c195cf0a9854b94151f7)
