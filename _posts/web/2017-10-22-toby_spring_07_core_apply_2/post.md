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
