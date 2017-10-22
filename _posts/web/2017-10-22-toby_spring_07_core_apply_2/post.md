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
ublic class JaxbXmlSqlReader implements SqlReader {

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
