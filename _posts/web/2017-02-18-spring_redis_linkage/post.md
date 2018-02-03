---
layout: post
title:  "Spring에서 Redis 사용하기"
date:   2017-02-18
desc: "Spring에서 Redis 사용하기"
keywords: "redis, spring, database"
categories: [Web]
tags: [redis, spring, database]
icon: icon-html
---

## Overview Redis

![2017-02-18-spring_redis_linkage/redis.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis.jpg)

 Redis는 "REmote DIctionary System"의 약자로 **memory 기반의 key / value store** 이다.
 Cassandra나 HBase와 같이 NoSQL DBMS로 분류되기도 하고, memcached와 같은 In memory solution으로 분류되기도 한다.

 성능은 memcached에 버금가면서 다양한 데이터 구조를 지원함으로써, Message Queue, Shared Memory, Remote Dicitionary 용도로 사용될 수 있다.

 이러한 점 때문에 인스타그램, 라인플러스의 LINE 메신저, StackOverflow, Blizzard, digg 등 여러 소셜 서비스에 널리 사용되고 있다.

 > BSD 라이센스 기반의 오픈 소스이며, 최근 VMWare에 인수되어 계속되어 업그레이드되고 있다.
 > 16,000 라인 정도의 C code로 작성되어 있으며, Action script, C, C#, C++, Java, Node.js, Objective-c 등 다양한 언어를 지원한다. [https://redis.io/clients][redis_clients]

<br>
### Key/Value Store

 Redis는 기본적으로 key / value store 이다. 특정 키 값에 값을 저장하는 구조로 되어 있고, 기본적인 PUT / GET operation을 지원한다.

![2017-02-18-spring_redis_linkage/key-value.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/key-value.jpg)

 단, 이 모든 데이터는 memory에 저장되고, 이로 인하여 매우 빠른 write / read 속도를 보장한다. 그래서 전체 저장 가능한 데이터 용량은 물리적인 memory 크기를 넘을 수 있다. (물론 OS의 disk swapping 영역 등을 사용하여 확장은 가능하겠지만, 성능이 급격하게 떨어지므로 의미가 없다.)

 데이터 엑세스는 memory에서 일어나지만 server restart와 같이 서버가 내려갔다가 올라오는 상황에서 데이터 저장하는 것을 보장하기 위해 disk를 persistence store로 사용한다.

<br>
### 다양한 데이터 타입

 단순한 memory 기반의 key / value store 라면 이미 memcached를 사용해도 되는데 어떤 차이가 있길래 redis가 각광받고 있는 것일까?

 Redis가 key / value store 이기는 하지만 value가 단순한 object가 아니라 자료구조르 갖기 때문에 큰 차이를 보인다.
 Redis가 지원하는 데이터 타입은 크게 아래와 같이 5가지가 있다.

---
#### String

 일반적인 문자열로 최대 512MByte 길이까지 지원한다.
 Text 문자열 뿐만 아니라 integer와 같은 숫자나 jpg와 같은 binary file 까지 저장할 수 있다.

 [https://redis.io/commands#string][command_string]

---
#### Set

 set은 string의 집합이다. 여러 개의 값을 하나의 value 내에 넣을 수 있다고 생각하면 되며, 블로그 포스트의 tagging에 사용될 수 있다.
 재미있는 점은 set 간의 연산을 지원하는데, 집합인만큼 교집합, 합집합, 차이 (Differences)를 매우 빠른 시간내에 추출할 수 있다.

![2017-02-18-spring_redis_linkage/data_type_set.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/data_type_set.jpg)

 [http://redis.io/commands#set][command_set]

---
#### Sorted Set

 Set에 "score" 라는 필드가 추가된 데이터 형으로 score는 일종의 **가중치** 이다.
 Sorted set 에서 데이터는 오름차순으로 내부 정렬되며, 정렬이 되어 있는 만큼 score 값 범위에 따른 query (range query), top rank에 따른 query 등이 가능하다.

![2017-02-18-spring_redis_linkage/data_type_sortedset.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/data_type_sortedset.jpg)

 [http://redis.io/commands#sorted_set][command_sorted_set]

---
#### Hashes

 Hash는 value 내에 field / string value 쌍으로 이루어진 테이블을 저장하는 데이터 구조체이다.
 RDBMS에서 PK 1개와 string 필드 하나로 이루진 테이블이라고 이해하면 된다.

![2017-02-18-spring_redis_linkage/data_type_hash.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/data_type_hash.jpg)

 [http://redis.io/commands#hash][command_hash]

---
#### List

 List는 string 들의 집합으로 저장되는 데이터 형태는 set 과 유사하지만, 일종의 양방향 linked list라고 생각하면 된다.
 List 앞과 뒤에서 PUSH / POP 연산을 이용해서 데이터를 넣거나 뺄 수 있고, 지정된 INDEX 값을 이용하여 지정된 위치에
 데이터를 넣거나 뺄 수 있다.

![2017-02-18-spring_redis_linkage/data_type_list.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/data_type_list.jpg)

 [http://redis.io/commands#list][command_list]

<br>
---
### 데이터 구조체 정리

 지금까지 간략하게 redis가 지원하는 데이터 구조체들에 대해서 살펴보았다.
 Redis 데이터 구조체의 특징을 다시 요약하자면,

  * Value가 일반적인 string 뿐만 아니라, set, list, hash와 같은 집합형 데이터 구조를 지원한다.
  * 저장된 데이터에 대한 연산이나 추가 작업 가능하다. [합집합, 교집합, Range Query 등]
  * set은 일종의 집합, sorted set은 오름차순으로 정렬된 집합, hash는 키 기반의 테이블, list는 일종의 링크드 리스트와 같은 특성을 지니고 있다.

 일반적인 집합형 데이터 구조 (set, list, hash) 등은 redis에서 하나의 키당 총 2^32개의 데이터를 이론적으로 저장할 수 있으나, 최적의 성능을 낼 수 있는 것은 일반적으로 1,000 ~ 5,000개 사이로 알려져 있다.

 데이터 구조에 따른 저장 구조를 정리해서 하나의 그림에 도식화해보면 다음과 같다.

![2017-02-18-spring_redis_linkage/data_type_summary.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/data_type_summary.jpg)

### Persistence

 앞서도 언급하였듯이, redis는 데이터를 disk에 저장할 수 있다. memcached의 경우 메모리에만 데이터를 저장하기 때문에 서버가 shutdown 된 후에 데이터는 유실되지만, redis는 restart 후에 disk에 저장해놓은 데이터를 다시 읽어서 memory에 logging 하기 때문에 데이터가 유실되지 않는다.

 Redis 에서는 데이터를 저장하는 방법이 snapshotting 방식과 AOF (Append On File) 두가지가 있다.

---
#### Snapshotting

 순간적으로 memory에 있는 전체 내용을 disk에 저장하는 방식이다.
 SAVE와 BGSAVE 방식이 있다.

 * SAVE는 blocking 방식으로 순간적으로 redis의 모든 동작을 정지시키고, 그 때의 snapshot을 disk에 저장한다.
 * BGSAVE는 non-blocking 방식으로 별도의 process를 띄운 후, 명령어 수행 당시의 메모리 snapshot을 disk에 저장하며, 저장 순간에 redis는 동작을 멈추지는 않고 정상적으로 계속 동작한다.

 > 장점: memory의 snapshot을 그대로 뜬 것이기 때문에, 서버 restart시 snapshot만 load하면 되므로, restart 시간이 빠르다.
 > 단점: snapshot을 추출하는데 시간이 오래 걸리며, snapshot 추출된 후 서버가 down 되면 snapshot 추출 이후 데이터는 유실된다.

---
#### AOF

 AOF (Append On File) 방식은 redis의 모든 write / update operation 자체를 모두 별도의 log 파일에 기록하는 형태이다. 서버가 restart될 때 기록된 write / update operation을 순차적으로 재실행하며 데이터를 복구한다. operation이 발생할 때마다 매번 기록하기 때문에, RDB 방식과는 달리 특정 시점이 아니라 항상 현재 시점까지의 log를 기록할 수 있으며 기본적으로 non-blocking 방식이다.

 > 장점: log 파일에 대해서 append만 하기 때문에 log write 속도가 빠르며, 어느 시점에 server가 down 되더라도 데이터 유실은 발생하지 않는다.
 > 단점: 모든 write / update operation에 대해 log을 남기게 되므로 log 데이터 양이 RDB 방식에 비해 과대하게 크며, 복구시 저장된 write / update operation을 replay 하게 되므로 restart 속도가 느리다.

---
#### 권장되는 사용법

 RDB와 AOF 방식의 장단점을 상쇄하기 위해 두 가지 방식을 혼용해서 사용하는 것이 바람직하다.
 즉, 주기적으로 snapshot을 백업하고, 다음 snapshot 까지의 저장을 AOF 방식으로 수행한다.

 이렇게 하면 서버가 restart될 때 백업된 snapshot을 reload 하고, 소량의 AOF log만 replay하면 되기 때문에 restart 시간을 절약하고 데이터의 유실을 방지할 수 있다.

 [참고][reference_persistence]

### Redis 참고 자료

 * Redis 공식 문서: [http://redis.io/documentation][reference_redis_official]
 * Redis monitoring tool: [reference_redis_monitoring][reference_redis_monitoring]
 * Redis common use case: [http://highscalability.com/blog/2011/7/6/11-common-web-use-cases-solved-in-redis.html][reference_redis_common_use_case]
 * Web 기반 redis test console [http://try.redis.io/][reference_redis_test_console]
 * Redis clustering [https://redis.io/presentation/Redis_Cluster.pdf][reference_redis_clustering]

---
## Redis with Spring framework

 이 장에서는 Spring에서 Redis 를 이용하는 법을 설명한다.

 Jedis, Jredis... 등의 redis client libary를 추가해 사용하는 것과 spring 에서 제공하는 RedisTemplate를 함께 사용하는 방법이 있다.

 RedisTemplate를 사용하면 redis client libary 종류에 상관없이 사용할 수 있어 좋고, redis가 지원하는 자료구조를 사용하기 좋게 랩핑을 해준다.

 Jedis를 그냥 써도 좋지만, byte[] 타입으로 converting 노가다를 해야한다.
 여기서는 RedisTemplate를 이용해 redis를 사용하는 법을 설명한다.

---
### pom.xml에 추가

 처음에는 당연히 RedisTemplate를 사용하기 위해 pom.xml에 추가해야 한다.

 다음과 같이 pom.xml에 필요한 library를 추가한다.

 > Jedis client는 내부적으로 apache의 common-pool2를 사용하는데 각 library에서 version 의존성이 있으므로 주의해야 한다.
 > [https://groups.google.com/forum/#!topic/jedis_redis/sZXLV3hHCwQ][jedis_maven_version]

![2017-02-18-spring_redis_linkage/redis_maven_00.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_maven_00.jpg)
<br>
![2017-02-18-spring_redis_linkage/redis_maven_01.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_maven_01.jpg)

---
### applicationContext.xml에 추가

 다음과 같이 필요한 redis에 필요한 네임스페이스를 사용을 위해 추가한다.

![2017-02-18-spring_redis_linkage/redis_context.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_context.jpg)

---
### Redis 설치

 Redis를 다음과 같이 설치 후, 테스트를 해본다.
 > 여기서는 OSX에서 실험하였다.

![2017-02-18-spring_redis_linkage/redis_install.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_install.jpg)

---
### 기본적인 사용법

 Redis에 저장할 데이터를 담고 있는 간단한 클래스를 만들고 unit test를 통해 실제로 값이 제대로 redis에 써지고 읽히는지 확인하도록 한다.

---
#### User class

 다음과 같이 아이디 및 이름을 가지는 간단한 클래스를 만든다.

![2017-02-18-spring_redis_linkage/user.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/user.jpg)

---
#### Test setup

 Redis 를 사용하기 위해 필요한 객체들을 선언하고, 초기화할 준비한다.

 > Spring의 application context를 통해 bean 주입을 통해 초기화하지 않았으며, 테스트 클래스에서 직접 초기화하도록 해보았다.

![2017-02-18-spring_redis_linkage/redis_test_setup.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_test_setup.jpg)

 * JedisConnectionFactory: Redis에 접속할 수 있도록 필요한 connection 정보를 담고 있는 redis client, Jedis의 connection factory이다.
 * StringRedisSerializer: Redis에 데이터를 저장할 때 string 형태로 직렬화하기 위해 필요하다.
 * Jackson2JsonRedisSerializer: 위의 User class와 같이 한 오브젝트에 다양한 타입의 데이터가 있을 때, json 형태로 redis에 저장하기 위해 필요하다.
 * RedisTemplate: Spring에서 redis를 간단하게 사용할 수 있도록 해준다.
 * ValueOperations: Redis에 저장하는 각 데이터 타입에 따라 operation을 쉽게 사용할 수 있도록 해준다.

---
#### Redis Test

 위와 같이 Setup 함수에서 redis를 사용하기 위해 필요한 객체들을 초기화한 후, ValueOperations를 통해 User class 인스턴스의 정보를 set 한 후, get을 다시해보았다. 다음과 같이 테스트를 통과하는 것을 알 수 있다.

![2017-02-18-spring_redis_linkage/redis_test_simple_test00.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_test_simple_test00.jpg)

redis-cli를 통해 실제 redis server에서 해당 키값에 대한 정보가 저장되었는지 확인하였다. 다음과 같이 json 형태로 저장되어 있는 것을 확인할 수 있었다.

![2017-02-18-spring_redis_linkage/redis_cli_after_test00.jpg](/static/assets/img/blog/web/2017-02-18-spring_redis_linkage/redis_cli_after_test00.jpg)

[redis_clients]: https://redis.io/clients "https://redis.io/clients"
[command_string]: https://redis.io/commands#string "https://redis.io/clients"
[command_set]: http://redis.io/commands#set "http://redis.io/commands#set"
[command_sorted_set]: http://redis.io/commands#sorted_set "http://redis.io/commands#sorted_set"
[command_hash]: http://redis.io/commands#hash "http://redis.io/commands#hash"
[command_list]: http://redis.io/commands#list "http://redis.io/commands#list"
[reference_persistence]: http://redis.io/topics/persistence "http://redis.io/topics/persistence"
[reference_redis_official]: http://redis.io/documentation "http://redis.io/documentation"
[reference_redis_monitoring]: http://charsyam.wordpress.com/2012/06/20/redis-monitoring-tool-redislive-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0/ "http://charsyam.wordpress.com/2012/06/20/redis-monitoring-tool-redislive-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0/"
[reference_redis_common_use_case]: http://highscalability.com/blog/2011/7/6/11-common-web-use-cases-solved-in-redis.html "http://highscalability.com/blog/2011/7/6/11-common-web-use-cases-solved-in-redis.html"
[reference_redis_test_console]: http://try.redis.io/ "http://try.redis.io/"
[reference_redis_clustering]: https://redis.io/presentation/Redis_Cluster.pdf "https://redis.io/presentation/Redis_Cluster.pdf"
[jedis_maven_version]: https://groups.google.com/forum/#!topic/jedis_redis/sZXLV3hHCwQ "https://groups.google.com/forum/#!topic/jedis_redis/sZXLV3hHCwQ"
