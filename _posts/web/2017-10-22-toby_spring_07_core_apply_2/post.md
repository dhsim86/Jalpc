---
layout: post
title:  "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.2"
date:   2017-10-22
desc: "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.2"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
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
| ---------- | :--------- | :----------: |
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

위와 같이 문자열로 된 리소스 정보를 Resource 오브젝트로 변환해서 프로퍼티에 주입할 때, 애플리케이션 컨텍스트 자신이 ResourceLoader로서 변환과 로딩기능을 담당한다. 따라서 빈 입장에서는 추상화된 Resource 타입의 오브젝트를 주입받으므로 리소스가 어떤 종류인지 상관없이 동일한 방법으로 리소스를 읽을 수 있다.

Resource 타입은 다음과 같이 실제 리소스가 어떤 것이든 상관없이, getInputStream() 메소드를 통해 스트림으로 가져올 수 있다.

~~~java
InputStreamReader inputStreamReader = new InputStreamReader(resource.getInputStream());
~~~

이렇게 스프링의 리소스 추상화를 이용해서 리소스의 위치나 접근 방법에 독립적인 코드를 쉽게 만들 수 있다.

[Use Resource class for resource abstraction.](https://github.com/dhsim86/tobys_spring_study/commit/d5c2b6651f9f57523156815ae2bd98d7e5e8be38)
