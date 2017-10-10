---
layout: post
title:  "Toby's Spring Chap 07: 스프링 핵심 기술의 응용
date:   2017-10-10
desc: "Toby's Spring Chap 07: 스프링 핵심 기술의 응용
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

스프링이 가장 가치를 두고 적극적으로 활용하려고 하는 것은 자바 언어가 기반을 두고 있는 객체지향 기술로, 이 객체지향적인 언어의 장점을 적극적으로 활용하여 코드를 작성하도록 도와준다. 스프링을 사용하는 개발자도 스프링이 제공하는 이 세 가지 기술을 필요에 따라 스스로 응용할 수 있어야 한다.

## SQL과 DAO의 분리

DAO는 데이터를 가져오고 조작하는 작업의 인터페이스 역할을 하는 계층이다. 데이터 엑세스 로직이 변경되지 않더라도 DB의 테이블이나 컬럼명, SQL 문장이 바뀌면 DAO 코드가 수정되어야 한다. 따라서 **SQL을 적절히 분리하여, DAO 코드와 다른 파일이나 위치에 두고 관리하면 좋을 것이다.**

### SQL 제공 서비스

SQL 문장을 기존 프로퍼티를 설정하는 것과 같이 애플리케이션 컨텍스트에서 DI를 해줄 수도 있지만, SQL과 DI 설정정보가 섞여 있으면 보기가 좋지 않고 관리하기에도 적절하지 않다. 또한 애플리케이션 컨텍스트에서 SQL 문장을 정의한다면 애플리케이션을 다시 시작하기 전까지는 변경이 매우 어렵다는 점이 있다.

이러한 문제를 해결하기 위해, DAO가 사용할 SQL을 제공해주는 기능을 위한 독립된 서비스가 필요하다.

[Separated sql statement and DAO source code using SqlService.](https://github.com/dhsim86/tobys_spring_study/commit/d86a72d8ff3c9a18624106a7c2aa6fe2a70d1d82)

위와 같은 커밋 로그에서 DAO는 필요한 SQL 문장이 어디에 있고 어떻게 가져오는지에 신경 쓸 필요가 없고, 반대로 다양한 방법으로 구현될 수 있는 SqlService 인터페이스를 통해 DAO에는 영향을 주지 않은 채로 원하는 방식의 SQL 문장을 준비할 수 있다.

## 인터페이스의 분리와 자기참조 빈

애플리케이션 컨텍스트와 같은 스프링의 XML 설정 파일에서 SQL 정보를 넣어놓고 활용하는 것은 좋은 방법이 아니다. SQL을 저장해두는 독립적인 파일을 사용하는 것이 바람직하다. 따로 SQL 정보만 정의한 XML 파일을 통해 DAO에게 필요한 SQL 문장을 제공해주는 서비스를 만들 수 있을 것이다.

### JAXB

XML에 담긴 정보를 파일에서 읽어오는 방법은 다양한데, Java에서는 XML 문서정보를 동일한 구조의 오브젝트로 매핑해주는 JAXB가 있다. **JAXB의 강점은 XML 문서 정보를 거의 동일한 구조를 지니는 오브젝트로 직접 매핑시켜준다는 것이다.** 이를 통해 해당 XML을 읽어 마치 오브젝트처럼 다룰 수가 있다.

JAXB는 XML 문서의 구조를 정의한 **스키마를 통해 매핑할 오브젝트의 클래스를 자동으로 생성** 해주는 컴파일러도 제공한다. JAXB API는 이 자동생성된 클래스의 **annotation에 담긴 매핑정보를 통해 XML과 자동 변환작업을 수행한다.**

<br>
![00.png](/static/assets/img/blog/web/2017-10-10-toby_spring_07_core_apply/00.png)

---
**스키마**

다음과 같이 클래스 생성에 필요한 스키마를 작성한다. 스키마는 XML 문서의 구조를 정의하고 컴파일하여 클래스를 생성할 수 있도록 한다.

~~~xml
<?xml version="1.0" encoding="UTF-8" ?>
<schema xmlns="http://www.w3.org/2001/XMLSchema"
        targetNamespace="http://www.epril.com/sqlmap"
        xmlns:tns="http://www.epril.com/sqlmap" elementFormDefault="qualified">

    <element name="sqlmap">   <!-- SqlMap 정의 -->
        <complexType>
            <sequence>
                <element name="sql" maxOccurs="unbounded" type="tns:sqlType" />
            </sequence>
        </complexType>
    </element>

    <complexType name="sqlType"> <!-- SqlType 정의 -->
        <simpleContent>
            <extension base="string"> <!-- value의 타입을 지정 -->
                <attribute name="key" use="required" type="string" /> <!-- key의 타입 지정 -->
            </extension>
        </simpleContent>
    </complexType>
</schema>
~~~

---

**자동생성된 클래스**

JAXB는 다음과 같이 자동 생성된 클래스의 annotation에 담긴 매핑정보를 활용하여 XML 에 담긴 정보와 오브젝트를 매핑시킨다.

~~~java
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {"sql"})  // 매핑할 때 참고하는 정보가 annotation에 있다.
@XmlRootElement(name = "sqlmap")
public class Sqlmap {
  @XmlElement(required = true)
  protected List<SqlType> sql;

  public List<SqlType> getSql() {
    if (sql == null) {
      sql = new ArrayList<SqlType>();
    }
    return this.sql;
  }
}

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "sqlType", propOrder = {"value"})
public class SqlType {

  @XmlValue
  protected String value; // SQL을 저장할 필드
  @XmlAttribute(name = "key", required = true)
  protected String key; // key 애트리뷰트에담긴, 검색용 키값을 위한 String 타입의 필드

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String value) {
    this.key = value;
  }
}
~~~
