---
layout: post
title:  "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.1"
date:   2017-10-10
desc: "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.1"
keywords: "spring, toby spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

스프링이 가장 가치를 두고 적극적으로 활용하려고 하는 것은 자바 언어가 기반을 두고 있는 객체지향 기술로, 이 객체지향적인 언어의 장점을 적극적으로 활용하여 코드를 작성하도록 도와준다. 스프링을 사용하는 개발자도 스프링이 제공하는 이 세 가지 기술을 필요에 따라 스스로 응용할 수 있어야 한다.

<br>
## SQL과 DAO의 분리

DAO는 데이터를 가져오고 조작하는 작업의 인터페이스 역할을 하는 계층이다. 데이터 엑세스 로직이 변경되지 않더라도 DB의 테이블이나 컬럼명, SQL 문장이 바뀌면 DAO 코드가 수정되어야 한다. 따라서 **SQL을 적절히 분리하여, DAO 코드와 다른 파일이나 위치에 두고 관리하면 좋을 것이다.**

<br>
### SQL 제공 서비스

SQL 문장을 기존 프로퍼티를 설정하는 것과 같이 애플리케이션 컨텍스트에서 DI를 해줄 수도 있지만, SQL과 DI 설정정보가 섞여 있으면 보기가 좋지 않고 관리하기에도 적절하지 않다. 또한 애플리케이션 컨텍스트에서 SQL 문장을 정의한다면 애플리케이션을 다시 시작하기 전까지는 변경이 매우 어렵다는 점이 있다.

이러한 문제를 해결하기 위해, DAO가 사용할 SQL을 제공해주는 기능을 위한 독립된 서비스가 필요하다.

[Separated sql statement and DAO source code using SqlService.](https://github.com/dhsim86/tobys_spring_study/commit/d86a72d8ff3c9a18624106a7c2aa6fe2a70d1d82)

위와 같은 커밋 로그에서 DAO는 필요한 SQL 문장이 어디에 있고 어떻게 가져오는지에 신경 쓸 필요가 없고, 반대로 다양한 방법으로 구현될 수 있는 SqlService 인터페이스를 통해 DAO에는 영향을 주지 않은 채로 원하는 방식의 SQL 문장을 준비할 수 있다.

<br>
## 인터페이스의 분리와 자기참조 빈

하지만 앞서 언급하였듯이, 애플리케이션 컨텍스트와 같은 스프링의 XML 설정 파일에서 SQL 정보를 넣어놓고 활용하는 것은 좋은 방법이 아니다. SQL을 저장해두는 독립적인 파일을 사용하는 것이 바람직하다. 따로 SQL 정보만 정의한 XML 파일을 통해 DAO에게 필요한 SQL 문장을 제공해주는 서비스를 만들 수 있을 것이다.

<br>
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

다음과 같이 JAXB 컴파일러로 컴파일하면 다음 절에 나오는 클래스들이 생성될 것이다.

<br>
![01.png](/static/assets/img/blog/web/2017-10-10-toby_spring_07_core_apply/01.png)

컴파일을 진행할 때는 생성되는 클래스들이 위치할 패키지 이름을 제공해야 한다.

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

**SQL map XML**

~~~xml
<sqlmap>
  <sql key="add">insert</sql>
  <sql key="get">select</sql>
  <sql key="delete">delete</sql>
</sqlmap>
~~~

\<sql\> 태그는 각 SqlType 클래스 오브젝트로 매핑되며, @XmlAttribute 및 @XmlValue로 지정한 필드들에 각 키 값 및 sql 문장이 할당된다. @XmlElement에 의해 매핑된 SqlType 클래스 오브젝트들이 Sqlmap의 sql 리스트에 매핑될 것이다.

* 언마샬링(unmarshalling): JAXB에서 XML 문서를 읽어 자바의 오브젝트로 변환
* 마샬링(marshalling): 바인딩 오브젝트를 XML 문서로 변환

[Test JAXB for sqlmap](https://github.com/dhsim86/tobys_spring_study/commit/bc9e65532026894f18ea2e35c3b5dde46c3bb209)
<br>
[Use XmlSqlService for getting sql statement by key.](https://github.com/dhsim86/tobys_spring_study/commit/f7ab4532d04fddae7f348a3e689fb5801289fc58)

<br>
### 빈의 초기화 작업

다음과 같이 스프링 빈으로 등록되는 클래스의 생성자에서 복잡한 초기화 작업을 다루는 것은 좋지 않다.

~~~java
public class XmlSqlService implements SqlService {
  private Map<String, String> sqlMap = new HashMap<>();

  public XmlSqlService() {
    String contextPath = Sqlmap.class.getPackage().getName();

    try {
      JAXBContext context = JAXBContext.newInstance(contextPath);
      Unmarshaller unmarshaller = context.createUnmarshaller();
      InputStream inputStream = UserDao.class.getResourceAsStream("/sql/sqlmap.xml");
      Sqlmap sqlmap = (Sqlmap)unmarshaller.unmarshal(inputStream);

      for (SqlType sql : sqlmap.getSql()) {
        sqlMap.put(sql.getKey(), sql.getValue());
      }
    } catch (JAXBException e) {
      throw new RuntimeException(e);
    }
  }
  ...
~~~

오브젝트 생성 중에 발생하는 예외는 다루기가 힘들고, 상속하기에도 불편하며 보안에도 문제가 발생할 수 있다. **초기상태를 가지는 오브젝트를 만들어놓고, 별도의 초기화 메소드를 통해 사용하는 방법이 바람직하다.** 또한 코드 상에서 읽어들일 파일의 위치와 이름이 고정되어 있다. 코드와 다르게 바뀔 가능성이 있는 내용은 외부에서 DI 해주는 것이 좋다.

스프링에서는 빈 오브젝트를 생성하고 DI 작업을 수행해서 프로퍼티들을 모두 주입해준 뒤에 **미리 지정한 초기화 메소드를 호출해주는 기능을 갖고있다.**


> 스프링은 스프링 컨테이너가 빈을 생성한 뒤에 부가적인 작업을 수행할 수 있게 해주는 "빈 후처리기, BeanPostProcessor" 를 제공하는데, AOP를 위한 프록시 자동생성기 (ex: DefaultAdvisorAutoProxyCreator)가 대표적이다. 이 뿐만 아니라 annotation을 활용한 빈 설정을 지원하는 몇 가지 빈 후처리기가 있다.

다음과 같이 애플리케이션 컨텍스트 설정 파일에 \<context:annotation-config\> 를 추가하면, 빈 설정 기능에 사용할 수 있는 특별한 annotation을 사용할 수 있게 해주는 빈 후처리기들이 등록된다.

[context:annotation-config](https://dhsim86.github.io/web/2017/03/28/spring_annotations_01-post.html)

~~~xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                 http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
                 http://www.springframework.org/schema/context
                 http://www.springframework.org/schema/context/spring-context-4.3.xsd
                 http://www.springframework.org/schema/tx
                 http://www.springframework.org/schema/tx/spring-tx-4.3.xsd">

    <tx:annotation-driven/>
    <context:annotation-config/>
~~~

스프링에서는 **@PostConstruct** 라는 annotation이 지정된 메소드가 있으면, 해당 빈의 오브젝트를 생성하고 DI 작업을 마친 뒤에 해당 메소드를 자동으로 실행시켜준다. 따라서 빈 오브젝트의 초기화 메소드를 지정하는데 사용할 수 있다.

> @PostConstruct 는 java.lang.annotation 패키지에 포함된 JavaEE 5나 JDK 6에 포함된 표준 annotation 이다.

[Use @PostConstruct to load sqlmap.xml file.](https://github.com/dhsim86/tobys_spring_study/commit/58e341f983e30d32bad932e4c28bc8d92d68b2f8)

<br>
### 인터페이스 분리

~~~java
public class XmlSqlService implements SqlService {
	private Map<String, String> sqlMap = new HashMap<>();
	private String sqlMapFile;

	public void setSqlMapFile(String sqlMapFile) {
		this.sqlMapFile = sqlMapFile;
	}

	@PostConstruct
	public void loadSql() {
		String contextPath = Sqlmap.class.getPackage().getName();

		try {
			JAXBContext context = JAXBContext.newInstance(contextPath);
			Unmarshaller unmarshaller = context.createUnmarshaller();
			InputStream inputStream = UserDao.class.getResourceAsStream(sqlMapFile);
			Sqlmap sqlmap = (Sqlmap)unmarshaller.unmarshal(inputStream);

			for (SqlType sql : sqlmap.getSql()) {
				sqlMap.put(sql.getKey(), sql.getValue());
			}

		} catch (JAXBException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public String getSql(String key) throws SqlRetrievalFailureException {
		String sql = sqlMap.get(key);

		if (sql == null) {
			throw new SqlRetrievalFailureException("Can not find appropriate sql statement, key: " + key);
		}

		return sql;
	}
}
~~~

위와 같이 XmlSqlService 클래스는 XML 포맷의 SQL 구문을 읽어와서 HasMap 타입의 컬렉션에 저장해두는 방식으로 **고정되어 있다.** 만약 다른 포맷의 SQL 정보를 읽어와야 하거나 다른 방식으로 SQL 문장을 저장해둘려면 코드가 직접 수정되어야 한다. 이는 **단일 책임의 원칙**을 위반한 것으로 기술의 변화가 코드의 수정을 초래한다.

**"SQL을 가져오는 것"** 과 **"SQL을 보관하고 사용하는 것"** 은 서로 다른 이유로 변경될 수 있는 독립적인 **전략** 이다. 따라서 서로 관심이 다른 코드들을 분리하고, 유연하게 확장 가능하도록 DI를 적용해볼 수 있다.

---

**책임에 따른 인터페이스 정의**

XmlSqlService 는 다음과 같은 독립적으로 변경가능한 책임이 있다.

* SQL 정보를 외부의 리소스로부터 로드
  * XML이든 다른 포맷의 리소스이든 애플리케이션에서 SQL을 사용할 수 있도록 메모리로 로드하는 책임
* SQL을 보관해두고 있다가 필요할 때 제공
  * 어떤 방식으로 저장하든 애플리케이션에서 정해진 인터페이스를 통해 SQL을 제공해주는 책임

DAO에 SQL을 제공해주는 "SqlService" 인터페이스를 제공하는 오브젝트는 다음과 같이 위의 두 가지 책임을 가진 오브젝트와 협력해서 동작하도록 해야 한다.

<br>
![02.png](/static/assets/img/blog/web/2017-10-10-toby_spring_07_core_apply/02.png)

위 그림과 같이 **SqlReader** 와 **SqlRegistry** 두 가지 타입의 오브젝트를 사용하여 DAO에서 필요한 SQL 을 제공하는 기능을 구현한다. SqlRegistry의 일부 인터페이스는 런타임에 등록된 SQL 문장을 변경할 수 있도록 **SqlUpdater** 와 같이 다른 곳에서 사용하게 할 수도 있다.

그런데 다음과 같이 SqlReader 및 SqlRegistry 를 사용하는 SqlService 에서 SqlReader로부터 SqlRegistry로 데이터를 전달하는 코드가 필요할 수 있다.

~~~java
Map<String, String> sqls = SqlReader.readSql();
SqlRegistry.addSqls(sqls);
~~~

SqlService 에서는 단순히 SQL 정보를 활용하는 것이 아닌, 그냥 전달하는 것이 전부라면 위 코드와 같이 작성될 필요가 없다. 위 코드는 **Map** 이라는 오브젝트로 서로 다른 두 타입(SqlReader, SqlRegistry)의 인터페이스의 파라미터를 불필요하게 강제하기 때문이다.

위 코드와 같이 작성하기보다는, 다음과 같이 SqlReader 에게 SqlRegistry **전략** 을 제공하면서 읽은 Sql 정보를 SqlRegistry에 등록하라고 요청하는 것이 좋다.
~~~java
sqlReader.readSql(SqlRegistry);
~~~

그러면 외부에서 특정 포맷으로 변환한 Sql 정보를 주고받을 필요없이, SqlReader가 SqlRegistry에 Sql 정보를 직접 등록하게 함으로써, **서로 각자의 구현 방식을 독립적으로 유지하면서 필요한 관계만 가지고 협력해서 일을 하는 구조가 된다.**

> 자바의 오브젝트는 데이터를 가질 수 있는데, 자신이 가진 데이터를 이용해 어떻게 작업할지는 자기 자신이 가장 잘 알고 있다. 꼭 필요하지 않은 이상, 오브젝트 내부의 데이터를 외부로 노출시킬 필요가 없다.

<br>
![03.png](/static/assets/img/blog/web/2017-10-10-toby_spring_07_core_apply/03.png)

다음 **use self-reference to separate responsibility.** 커밋로그처럼, **자기 참조 빈** 을 통해 책임 분리가 필요한 클래스를 유연한 구조로 만들고자 할 때 처음 시도해볼 수 있는 방법이 있다. 책임과 관심사가 복잡하게 얽혀 있는 것을 유연하게 만들 때 사용해 볼만한 방법이다.

[use self-reference to separate responsibility.](https://github.com/dhsim86/tobys_spring_study/commit/523a7ed0ee946ecb3dfdfe36347ab32da7ffb3a8)
<br>
[use independent beans implements SqlService, SqlReader, SqlRegistry.](https://github.com/dhsim86/tobys_spring_study/commit/fc567d7fee215706bcfe7954ec8d386a3b94a669)

---

**디폴트 의존관계를 갖는 빈**

확장을 고려해서 기능을 분리하고, 인터페이스와 전략 패턴을 도입하고, DI를 적용해나간다면 늘어난 클래스와 인터페이스 구현과 의존관계 설정에 대한 부담은 감수해야 한다.

특정 의존 오브젝트가 대부분의 환경에서 거의 디폴트로 사용된다면 디폴트 의존관계를 갖는 빈을 만드는 것을 고려해볼 필요가 있다. **DI 를 사용한다고 해서 항상 모든 프로퍼티 설정을 둘 필요가 없으며, 자주 사용되는 의존 오브젝트는 별도의 설정이 없으면 디폴트로 사용하게 하는 것도 좋은 방법이다.**

~~~java
public class DefaultSqlService extends BaseSqlService {
  public DefaultSqlService() {
    setSqlReader(new JaxbXmlSqlReader());
    setSqlRegistry(new HashMapSqlRegistry());
  }
}
~~~

위 코드와 같이 거의 대부분의 상황에서 JAXB를 통해 SQL 문장을 XML 포맷으로 읽거나, HashMap을 통해 SQL 문장을 저장한다면 디폴트 의존 오브젝트를 사용하는 빈을 만들 수 있다.

> 위의 DefaultSqlService 가 BaseSqlService 를 상속하였다는 것이 중요하다. sqlReader와 sqlRegistry 를 설정하기 위한 setter 메소드를 그대로 갖고 있어서 설정 파일에서 얼마든지 변경할 수 있으므로, 디폴트가 아닌 다른 기술을 사용하는 오브젝트를 사용하고자할 때는 설정 파일에서 해당 프로퍼티를 설정해주면 된다.

[use DefaultSqlService.](https://github.com/dhsim86/tobys_spring_study/commit/1ba668a7e9bce4faecb22334a8c9a9fd5eb9e206)
