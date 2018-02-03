---
layout: post
title:  "Java Web Programming Summary Note 04: Persistence Framework"
date:   2017-01-28
desc: "Java Web Programming Summary Note 04: Persistence Framework"
keywords: "java, web"
categories: [Web]
tags: [java, web]
icon: icon-html
---

> Java Web Development Workbook Chapter. 07

# Persistence Framework

JDBC API를 직접 호출할 필요없이, 데이터베이스에 접근하여 CRUD 진행, 개발자 대신에 프레임워크가 JDBC API 호출

> Persistence: 데이터의 지속성, 애플리케이션을 종료하고 다시 실행해도 이전에 저장한 데이터를 다시 로드하는 기술
> Persistence Framework: 데이터의 저장, 조회, 변경, 삭제를 다루는 클래스 / 설정 파일 집합

* SQL Mapper: SQL 문장으로 직접 DB 데이터를 다룸 **(MyBatis)**
* ORM (Object-Relational Mapper): 자바 객체를 통해 간접적으로 DB 데이터를 다룸 **(Hibernate, TopLink)**

<br>
## ORM (Object-Relational Mapper)

프레임워크에서 제공하는 API와 전용 객체 질의어를 통해 데이터를 다룸.
객체 질의어를 사용함으로써, SQL 문장을 몰라도 됨. (DBMS에 맞추어 SQL 문장을 생성)
> Hibernate 는 HQL 이라는 객체 질의어 제공

* 한계
  * 테이블과 객체를 연결, 객체를 통해 간접적으로 다루기 위해 DB의 정규화가 잘 되어 있어야 함.
  * DB 특징에 맞추어 최적화를 할 수가 없음
    * DBMS는 각자 자신만의 특별한 기능을 전용 SQL을 통해 제공, ORM에서는 SQL 문장을 작성하지 않으므로 활용 불가

<br>
# MyBatis

MyBatis는 SQL Mapper를 제공, 개발과 유지보수가 쉽도록 SQL 문장을 코드와 분리.
-> 데이터베이스 프로그래밍을 간결화

---
* 일반적인 JDBC 프로그래밍

~~~java
stmt = connection.prepareStatement(
  "update projects set " +
  " pname = ?," +
  " contents = ?," +
  " state = ?" +
  " where pno = ?"
);
stmt.setString(1, project.getTitle());
...
~~~
* MyBatis 사용

~~~java
... // SQL 문을 다루는 문장이 없음
~~~
~~~xml
update projects set
 pname=#{title},
 content=#{content},
 state=#{state},
 where pno=#{no}
~~~
---

* 다음과 같이 pom.xml에 MyBatis 의존성 (version: 3.3.1)

~~~xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.3.1</version>
</dependency>
~~~

<br>
## Mybatis의 핵심 컴포넌트

| Component | Description |
| ---------- | :--------- |
| SqlSession | 실제 SQL을 실행하는 객체, SQL을 처리하기 위해 JDBC 드라이버 사용 |
| SqlSessionFactory | SqlSession 객체 생성 |
| SqlSessionFactoryBuilder | mybatis 설정 파일의 내용을 토대로 SqlSessionFactory 생성 |
| mybatis 설정 파일 | DB 연결정보, 트랜잭션 정보, mybatis 제어 정보등의 설정 포함, SqlSessionFactory 생성시 사용 |
| SQL Mapper 파일 | SQL 문을 담고 있는 파일, SqlSession 객체가 참조 |

<br>
## SqlSession

SqlSession: SQL 문장을 실행하는 도구
* 직접 생성할 수 없고, SqlSessionFactory를 통해서만 얻을 수 있음.

| Component | Description |
| ---------- | :--------- |
| selectList | select 문을 실행, 값 객체 (Value Object) 목록을 반환 |
| selectOne | select 문을 실행, 하나의 값 객체를 반환 |
| insert | insert 문을 실행, 반환값은 입력한 데이터 개수 |
| update | update 문을 실행, 반환값은 변경한 데이터 개수 |
| delete | delete 문을 실행, 반환값은 삭제한 데이터 개수 |

<br>
### selectList

~~~java
List<E> selectList(String sqlId)
List<E> selectList(String sqlId, Object parameter)
~~~
* sqlId: SQL Mapper의 네임스페이스 이름 + SQL 문의 아이디
* 값이 필요하다면 두 번째 파라미터로 값 객체를 넘김

---

~~~java
...
sqlSession.selectList("spms.dao.ProjectDao.selectList")
...
~~~
~~~xml
<mapper namespace="spms.dao.ProjectDao">
  <select id="selectList" resultMap="projectResultMap">
    select pno, pname, sta_date, end_date, state
    from projects
    order by pno desc
  </select>
  ...
~~~

<br>
### insert

~~~java
sqlSession.insert("spms.dao.ProjectDao.insert", project);
~~~
~~~xml
<insert id="insert" parameterType="project">
  insert into projects(pname, content, sta_date, end_date, state, cre_date, tags)
  values (#{title}, #{content}, #{startDate}, #{endDate}, 0, now(), #{tags})
</insert>
~~~

* #{} 자리에 property 객체의 프로퍼티 값
* #{title}의 경우 project 객체의 getTitle() 메소드의 반환값이 놓임
> 객체의 프로퍼티: 인스턴스 변수를 말하는 것이 아닌, getter / setter를 가리키는 용어. 프로퍼티 이름은 getter / setter 메소드의 이름에서 추출

<br>
### selectOne / delete

~~~java
sqlSession.selectOne("spms.dao.ProjectDao.selectOne", no);
...
sqlSession.delete("spms.dao.ProjectDao.delete", no);
~~~
~~~xml
<delete id="delete" parameterType="int">
  delete from projects
  where pno=#{value}
</delete>
~~~

* Primitive 타입의 경우 각 해당하는 타입의 랩퍼 클래스 객체로 auto-boxing (int -> Integer)
* SQL mapper에서 사용시, #{}에 들어갈 이름으로 아무 이름이나 사용 가능

<br>
### commit / rollback

DBMS는 insert / update / delete 문을 실행할 때 그 작업 결과를 임시 데이터베이스에 보관
-> 클라이언트의 요청이 있을 때 운영 데이터베이스에 반영

* commit: 임시 데이터베이스에 보관된 작업 결과를 운영 데이터베이스에 적용 요청
* rollback: 임시 데이터베이스의 작업 결과를 반영하지 않고 취소 요청
* **autocommit**
  * 자동으로 commit 하고 싶을 때 다음과 같이 지정
  * 트랜잭션을 다룰 수는 없음

~~~java
SqlSession sqlSession = SqlSessionFactory.openSession(true);
~~~

<br>
## SQL Mapper

<br>
### \<mapper\>
~~~xml
<mapper namespace="spms.dao.ProjectDao">
  ...
</mapper>
~~~

* namespace 속성은 자바의 패키지처럼 SQL문을 묶는 용도로 사용. 모든 SQL 문장은 \<mapper\> 태그에 놓임

<br>
### \<select\>, \<insert\>, \<update\>, \<delete\>

각 select / insert / update / delete 문을 각 태그에 맞추어 사용

~~~xml
<select id="selectList" ... >
  ...
</select>
~~~
* id 를 통해 각 SQL 문을 구분

<br>
### resultType

select 문을 실행하면, 결과가 생성되는데 이 결과를 담을 객체를 지정하는 속성

~~~xml
<select id="selectList" resultType="spms.vo.Project" >
~~~
* 보통 클래스의 이름 (full qualified name) 이 온다

만약 mybatis 설정 파일에 다음과 같이 alias가 설정되어 있다면 그 alias에 정의된 이름을 사용 가능

~~~xml
<typeAliases>
  <typeAlias type="spms.vo.Project" alias="project" />
</typeAliases>
~~~
~~~xml
<select id="selectList" resultType="project" />
~~~

Mybatis는 select 결과를 저장하고자, **resultType** 에 선언된 클래스의 인스턴스를 생성한다.
그리고 각 컬럼에 대응하는 **setter** 메소드를 찾아 호출하여 컬럼 값을 인스턴스의 필드에 저장한다.
* 만약 해당하는 setter가 없으면 그 컬럼 값은 저장되지 않음

<br>
### DB column 이름 및 setter 불일치 해결

위에서 해당하는 setter가 없으면 그 컬럼 값은 저장되지 않는데 다음 두 가지 방법으로 해결

1. SQL 문에 as를 통한 별명 사용

~~~xml
<select id="selectList" resultType="project" >
  select
   PNO as no,
   PNAME as title,
   ...
~~~

2. \<resultMap\>
SQL 문에 각 컬럼마다 별명을 붙이는 대신, \<resultMap\> 태그를 통해 컬럼과 연결될 **setter** 메소드 정의

~~~xml
<resultMap type="project" id="projectResultMap">
  <id column="PNO" property="no" />
  <result column="PNAME" property="title" />
  <result column="STA_DATE" property="startDate" javaType="java.sql.Date" />
  ...
</resultMap>
~~~
* \<resultMap\> 태그의 type: 컬럼 데이터를 저장할 클래스의 이름 또는 별명
* \<result\> 태그
  * 컬럼과 **setter** 메소드의 연결을 정의
  * column 에는 컬럼 이름 지정 / property 에는 객체의 프로퍼티 이름 지정
  * javaType: 컬럼의 값을 특정 자바 객체로 변환, 지정하지 않을 경우 setter 메소드의 파라미터 타입으로 변환
* \<id\> 태그
  * 이 태그에서 지정한 프로퍼티는 객체 식별자로 사용됨
  * select를 통해 생성된 결과 객체들은 캐싱해두는데, 이 임시 저장된 객체를 구분하기 위한 값으로 사용

> MyBatis는 결과 레코드에 대해 객체 캐싱을 제공. 결과 객체를 풀 (pool) 에 보관해두었다가, 다시 질의가 들어오면 객체 풀에 저장된 객체 중에서 **id** 에 지정된 컬럼의 값과 일치하는 객체를 찾음

<br>
### \<select\> 태그에 resultMap 적용

select 결과에 대해 \<resultMap\> 에 정의된 대로 자바 객체를 생성하고 싶다면, 다음과 같이 resultMap 속성에 id 지정

~~~xml
<select id="selectList" resultMap="projectResultMap">
  ...
~~~
