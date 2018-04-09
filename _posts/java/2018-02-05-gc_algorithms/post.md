---
layout: post
title:  "Garbage Collection Algorithms"
date:   2018-02-05
desc:  "Garbage Collection Algorithms"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# Garbage Collection Algorithms

<br>
## GC Algorithms: Basics

자바의 GC 알고리즘들을 설명하기에 앞서서, 이 알고리즘을 설명하는데에 있어서 필요한 기본 개념을 다시 살펴볼 필요가 있다. GC 알고리즘마다 다르긴 하지만 보통 GC 알고리즘들은 다음 두 가지 일에 포커싱을 맞춘다.

* 현재 살아있는 객체를 판별하는 것
* 더 이상 사용되지 않는다고 간주되는, 그 외의 객체는 정리하는 것

GC에 구현된 살아있는 객체를 조사하는 첫 번째 일은 **Marking**이라 부른다.

<br>
### Marking Reachable Objects

JVM에서 사용할 수 있는 모든 GC 알고리즘은 **어느 객체가 살아있는지 조사하는 것부터 시작한다.** 이 컨셉은 다음 그림에서 보여주는 JVM의 메모리 레이아웃을 통해 설명할 수 있다.

<br>
![00.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/00.png)

첫 번째로, GC는 먼저 **Garbage Collection Roots (GC Roots)**라 불리는 특별한 객체를 정의한다. 다음은 GC Roots라 불릴 수 있는 객체의 종류이다.

* 지역 변수나 현재 수행되고 있는 메소드의 파라미터 객체들
* 활성화된 스레드
* Static 객체
* JNI 참조 정보

다음으로, GC는 **GC Roots로부터 시작하여, 객체가 참조하는 것을 따라가며 (위 그림을 대변하자면, 객체 그래프를 순회하며) 살아있는 모든 객체를 탐색한다.** 탐색된 모든 객체는 **Marked** 된다.

위의 그림에서 **푸른색 vertex로 표현된 것은 살아있는 객체라 판별된 객체이다. 이 단계가 끝나면 살아있는 모든 객체는 모두 Marking 되었을 것이며,** 그 외의 모든 객체들은 (위의 그림에서 회색 그래프로 표현된 객체들) GC Roots로부터 닿지 않는, 애플리케이션에서 더 이상 사용되지 않는 객체들로 간주된다. 이 객체들은 GC의 대상이며, 다음 단계에서 GC 알고리즘은 이 객체들이 점유한 메모리를 회수해야 한다.

Marking 단계에는 알아야 할 중요한 것은 다음과 같다.

* 이 단계에서 **애플리케이션 스레드는 잠시 멈출 필요가 있다.** 애플리케이션 스레드를 멈추지 않고 이 단계를 진행하면, 애플리케이션 스레드가 하는 일에 따라 영원히 끝나지 않을 수 있다. (그래프가 계속 변하게 될 것이므로). 따라서 애플리케이션 스레드를 잠시 멈추고 살아있는 객체들을 정확히 판별한다. 그래서 보통 GC 알고리즘에서 이 단계는 **Stop-The-World 이벤트이다.** (여러 단계로 나누어서 애플리케이션 스레드와 동시에 일을 할 수 있더라도 Stop-The-World 이벤트를 트리거하는 단계는 반드시 있다.)
* 이 단계에서 걸리는 시간은 heap 영역의 크기나 전체 객체의 수가 아니라, **살아있는 객체의 수에 비례한다.** 따라서 heap 영역 사이즈를 늘린다고 이 단계에서 걸리는 시간에 직접적인 영향을 주지는 않는다.

이 단계가 끝나면 GC는 다음 단계인, 사용되지 않는 객체를 정리하는 단계로 넘어갈 수 있다.

<br>
### Removing Unused Objects

더 이상 사용되지 않는 객체의 메모리를 회수하는 일은 GC 알고리즘마다 구현이 다르긴 하지만, 보통 **Mark and Sweep, Mark-Sweep-Compact, Mark and Copy 중의 하나에 들어간다.**

<br>
### Sweep

**Mark and Sweep**에서 이 Sweep 단계는 Marking 단계가 끝난 후, GC Roots 및 살아있는 객체로 표현되는 그래프에 포함되지 않는 객체들의 **메모리 영역이 회수한다.** 회수된 메모리 영역은 내부적으로 이 영역을 관리하는 **free-list** 라는 자료구조를 통해 관리한다. 아마도 이 자료구조는 다시 사용할 수 있는 영역과 그 것의 크기를 기록해두었을 것이다.

<br>
![01.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/01.png)

> 메모리 단편화 여부에 따라 전체 메모리 공간은 충분하나, 실제 객체 생성을 할 수 있는 **충분한 연속적인 공간이 없다면** OOM이 발생할 수도 있다.

<br>
### Compact

**Mark-Sweep-Compact**의 Compact 단계에서 실제로 살아있는, **Marking 된 객체들을 메모리 영역의 처음부터 몰아넣음으로써 Marn and Sweep의 단점을 제거한다.** 이는 실제 객체를 복사하고 이 객체들의 참조 정보를 업데이트함으로써 이루어지는데, GC의 시간을 증가시킨다. 하지만 이 것을 통해 얻을 수 있는 이익은 여러 가지가 있다.

* 메모리 단편화를 줄임으로써 발생하는 문제를 해결할 수 있다. (메모리 생성 실패 문제와 같은)
* 연속적인 공간에서 객체 생성을 하는 것은 아주 적은 연산을 필요로 한다.
    * 즉, 새로 객체를 생성하기 위해 적절한 메모리를 찾는 연산을 동반하는 파편화된 메모리 공간에서 할당하는 것보다 빠르다.

<br>
![02.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/02.png)

<br>
### Copy

**Mark and Copy**의 Copy 단계는 메모리 영역을 여러 영역으로 나누고, **살아있는 객체를 다른 영역으로 복사한다는 것을 의미한다.** 
(ex. Eden -> Survivor / From survivor -> To survivor / Survivor -> Old)

<br>
![03.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/03.png)

다른 영역으로 살아있는 객체를 옮기는 것이므로, Marking과 Copy 단계를 동시에 할 수 있다는 이점이 있다.

---

<br>
## Java 에서의 GC 알고리즘들

JVM 에서는 Generational Hypothesis 개념에 따라 **Young 영역 및 Old 영역으로 메모리 공간을 나누고, 각 영역에 대한 GC 알고리즘도 다르게 적용한다.**

JVM에서 제공하는 GC 알고리즘은 옵션을 통해 선택할 수 있으며, 선택하지 않으면 디폴트로 지정된 GC 알고리즘을 사용하게 된다.

다음은 옵션에 따라 적용되는 GC 알고리즘을 나타낸 것이다.

<br>

| Young GC | Old GC | JVM Options |
| --- | --- | --- |
| Incremental | Incremental | -Xincgc |
| **Serial** | **Serial** | **-XX:+UseSerialGC** |
| Parallel Scavenge | Serial | -XX:+UseParallelGC -XX:-UseParallelOldGC |
| Parallel New | Serial | N/A |
| Serial | Parallel Old | N/A |
| **Parallel Scavenge** | **Parallel Old** | **-XX:+UseParallelGC -XX:+UseParallelOldGC** |
| Parallel New | Parallel Old | N/A |
| Serial | CMS | -XX:-UseParNewGC -XX:+UseConcMarkSweepGC |
| Parallel Scavenge | CMS | N/A |
| **Parallel New** | **CMS** | **-XX:+UseParNewGC -XX:+UseConcMarkSweepGC** |
| **G1** | **G1** | **-XX:+UseG1GC** |

<br>
복잡하게 보이지만, 다음 4가지 케이스만 알아두면 된다. JVM Option이 없는 것들은 deprecated 되었거나, 실제 사용에 있어서는 적절하지 않은 알고리즘들이다.

* Serial GC (Young 영역 / Old 영역 모두)
* Parallel GC (Young 영역 / Old 영역 모두)
* Parallel New (Young 영역) + Concurrent Mark and Sweep (CMS, Old 영역)
* G1 (Young / Old 를 나타내는 바둑판(?) 영역)

<br>
## Serial GC

이 알고리즘에서는 **Young 영역에 대해서는 Mark-Copy, Old 영역에 대해서는 Mark-Sweep-Compact 를 사용한다.** Serial GC 라는 이름을 통해 짐작할 수 있겠지만, **하나의 스레드에 의해 수행되며 Young 영역 및 Old 영역에 대한 GC는 모두 Stop-The-World 를 일으킨다.**

JVM에서 이 알고리즘을 사용하기 위해서는 다음과 같이 JVM 파라미터를 설정하면 된다.

```
java -XX:+UseSerialGC com.mypackages.MyExecutableClass
```

**하나의 스레드를 통해 수행되므로, 멀티 코어의 이점을 제대로 못살린다.** CPU 코어가 몇 개이든 상관없이 이 GC를 사용할 때는 CPU 코어 하나만 사용하게 된다. 따라서 CPU가 하나인, 작은 크기의 heap 영역만 있으면 되는 환경일 때만 사용하는 것이 권장된다. 멀티코어 / 큰 크기의 메모리를 갖는, 시스템 리소스를 많이 사용할 수 있는 서버 환경에서 이 GC를 사용하는 것은 권장되지 않는다.

다음은 Serial GC를 사용하였을 때의 GC log 이다.
참고로, GC log를 확인하기 위해 다음과 같이 JVM 파라미터를 설정한다.
```
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps
```


```
2018-05-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
2018-05-26T14:45:59.690-0200: 172.829: [GC (Allocation Failure) 172.829: [DefNew: 629120K->629120K(629120K), 0.0000372 secs]172.829: [Tenured: 1203359K->755802K(1398144K), 0.1855567 secs] 1832479K->755802K(2027264K), [Metaspace: 6741K->6741K(1056768K)], 0.1856954 secs] [Times: user=0.18 sys=0.00, real=0.18 secs]
```

단 두 줄밖에 되지 않는 로그이지만 많은 정보를 가지고 있다. 위 로그를 통해 두 번의 GC가 일어났다는 것을 알 수 있는데, 하나는 Young 영역에 대한 GC (Minor GC)이고 다른 하나는 heap 영역 전체에 대한 GC (Full GC)이다.

<br>
### Minor GC

```
2018-05-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
```

다음은 이 로그에서 알 수 있는 내용들이다.

<div class="code-line-wrap">
<p class="code-line"><span class="node">2015-05-26T14:45:37.987-0200<sup>1</sup></span>:<span class="node">151.126<sup>2</sup></span>:[<span class="node">GC<sup>3</sup></span>(<span class="node">Allocation Failure<sup>4</sup></span>) 151.126: [<span class="node">DefNew<sup>5</sup></span>:<span class="node">629119K-&gt;69888K<sup>6</sup></span><span class="node">(629120K)<sup>7</sup></span>, 0.0584157 secs]<span class="node">1619346K-&gt;1273247K<sup>8</sup></span><span class="node">(2027264K)<sup>9</sup></span>,<span class="node">0.0585007 secs<sup>10</sup></span>]<span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2015-05-26T14:45:37.987-0200</span> – Time when the GC event started.</li>
<li class="description"><span class="node">151.126</span> – Time when the GC event started, relative to the JVM startup time. Measured in seconds.</li>
<li class="description"><span class="node">GC</span> – Flag to distinguish between Minor &amp; Full GC. This time it is indicating that this was a Minor GC.</li>
<li class="description"><span class="node">Allocation Failure</span> – Cause of the collection. In this case, the GC is triggered due to a data structure not fitting into any region in the Young Generation.</li>
<li class="description"><span class="node">DefNew</span> – Name of the garbage collector used. This cryptic name stands for the single-threaded mark-copy stop-the-world garbage collector used to clean Young generation.</li>
<li class="description"><span class="node">629119K-&gt;69888K</span> – Usage of the Young Generation before and after collection.</li>
<li class="description"><span class="node">(629120K)</span> – Total size of the Young Generation.</li>
<li class="description"><span class="node">1619346K-&gt;1273247K</span> – Total used heap before and after collection.</li>
<li class="description"><span class="node">(2027264K)</span> – Total available heap.</li>
<li class="description"><span class="node">0.0585007 secs</span> – Duration of the GC event in seconds.</li>
<li class="description"><span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]</span> – Duration of the GC event, measured in different categories:
<ul>
<li>user – Total CPU time that was consumed by the garbage collector threads during this collection</li>
<li>sys – Time spent in OS calls or waiting for system event</li>
<li>real – Clock time for which your application was stopped. As Serial Garbage Collector always uses just a single thread, real time is thus equal to the sum of user and system times.</li>
</ul>
</li>
</ol>
</div>

<style>
ol li, ul li {
    min-height: 1px;
    vertical-align: bottom;
}

.code-line-wrap {
    margin: 30px 0;
    border-left: 3px solid #ddd;
    border-radius: 3px;
}
.code-line {
    margin: 0;
    padding: 10px;
    background: #faf8f6;
    color: #009cd5;
    line-height: 24px;
    text-shadow: 0 1px 0 #fff;
    font-family: consolas,"courier new",monospace;
    overflow: auto;
}
.code-line-wrap span.node {
    display: inline-block;
    padding: 0 3px;
    line-height: 18px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #fff;
    color: #009cd5;
    white-space: nowrap;
    font-family: consolas,"courier new",monospace;
}
.code-line-wrap ol {
    line-height: 20px;
}
.code-line-components {
    margin-left: 0;
    padding: 0 0 20px 3.038em;
    overflow: auto;
}
.code-line-wrap ol li {
    padding: 2px 5px;
    position: relative;
    transition-duration: 0.2s;
    border: 0 solid #fff;
}
</style>

<script>
function bubbleAgentPosition() {
	jQuery('.bubble-agent .bubble').hover(function () {
		jQuery(this).closest('.bubble-agent').addClass('hover');
	}, function () {
		jQuery(this).closest('.bubble-agent').removeClass('hover');
	});
	checkBubbleAgentVerticalPosition();
}
function checkBubbleAgentVerticalPosition() {
	jQuery('.bubble-agent').each(function () {
		var agentWrap = jQuery(this);
		if (agentWrap.offset().top + agentWrap.outerHeight() < jQuery(window).scrollTop() + jQuery(window).height()) {
			agentWrap.find('.slider').animate({
				opacity: '1'
			}, 1000);
		}
	});
}
function checkBubbleAgentHorizontalPosition(e) {
	jQuery('.bubble-agent').not('.bubble-agent-fixed').each(function () {
		var agentWrap = jQuery(this),
			agent = agentWrap.find('.agent'),
			leftSpacing = 60,
			rightSpacing = agentWrap.hasClass('above-comment') ? 130 : 30,
			leftValue;

		if (agentWrap.is(':visible')) {

			leftValue = e.pageX - agentWrap.offset().left;
			leftValue = leftValue > agentWrap.outerWidth() - leftSpacing ? agentWrap.outerWidth() - leftSpacing : leftValue < rightSpacing ? rightSpacing : leftValue;

			agent.css('left', leftValue);
		}
	});
}

/* Modal */

function scrollbarWidth() {
	var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
		$outer = jQuery('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
		inner = $inner[0],
		outer = $outer[0];

	jQuery('body').append(outer);
	var width1 = inner.offsetWidth;
	$outer.css('overflow', 'scroll');
	var width2 = outer.clientWidth;
	$outer.remove();

	return (width1 - width2);
}

function modals() {
	jQuery('.modal .close, [data-modal-close]').on('click', function (e) {
		e.preventDefault();
		closeModal(jQuery(this).closest('.modal'));
	});

	jQuery('body').on('click', '[data-modal]', function (e) {
		e.preventDefault();
		var modalData = jQuery(this).data('modal');
		var modal = jQuery('#' + modalData);
		if (user.uid !== 0 && (modalData === 'modal-register' || modalData === 'modal-login')) {
			window.location.href = param.portalUrl;
		} else {
			showModal(modal);
		}
	});
}
function showModal(modal) {
	var wrap = jQuery('#modal-wrap'),
		$loginEmail = jQuery("#login-mail"),
		$passwordResetEmail = jQuery("#new-mail"),
		modalId = modal.attr("id");

	removeAllExistingValidationErrors(wrap);

	if (modalId === "modal-new-password") {
		$passwordResetEmail.val($loginEmail.val());
	}

	wrap
		.fadeIn(300)
		.find('.modal')
		.hide();
	modal.fadeIn(300);

	jQuery('html')
		.addClass('modal-open')
		.css({
			'overflow': 'visible',
			'margin-right': scrollbarWidth
		});
	jQuery('body').css('overflow', 'hidden');

	modal.find("input").first().focus();
}

function closeModal(modal) {
	var wrap = jQuery('#modal-wrap');

	wrap
		.fadeOut(300, function () {
			wrap.css('overflow', '');
			modal.hide();
		})
		.css('overflow', 'hidden');

	jQuery('html')
		.removeClass('modal-open')
		.css({
			'overflow': '',
			'margin-right': 0
		});
	jQuery('body').css('overflow', '');

	if (modal.find('.flex-video').length) {
		modal.find('.flex-video').html('');
	}
}

/* Modal panel */

function modalPanel() {
	jQuery('#modal-panel a.header').click(function (e) {
		e.preventDefault();

		var panel = jQuery(this).closest('.panel'),
			content = panel.find('.content');

		if (content.is(':visible')) {
			content.slideUp(300);
			panel
				.addClass('content-closed')
				.find('h2')
				.addClass('blink');
		} else {
			content.slideDown(300);
			panel
				.removeClass('content-closed')
				.find('h2')
				.removeClass('blink');
		}
	});

	jQuery('#modal-panel .panel.content-closed')
		.find('.header H2')
		.addClass('blink')
		.end()
		.find('.content')
		.hide();

	jQuery('[data-modal-panel-close]').on('click', function (e) {
		e.preventDefault();
		modalPanelClose();
	});
	jQuery('[data-modal-panel-cancel]').on('click', function (e) {
		e.preventDefault();
		modalPanelClose();
	});
}

function modalPanelOpen() {
	jQuery('#modal-panel').find('.panel').slideDown(300);
}

//if showSuccessMsg true, show msg
function modalPanelClose(showSuccessMsg) {
	jQuery('#modal-panel').find('.panel').slideUp(300, function () {
		if (showSuccessMsg) {
			jQuery('#modal-panel-msg')
				.slideDown(300)
				.delay(2500)
				.slideUp(300);
		}
	});
}

/* details table */

function detailsTable() {
	jQuery('table.details .open-details').click(function (e) {
		e.preventDefault();
		var link = jQuery(this),
			openLabel = link.data('open-label'),
			closeLabel = link.data('close-label'),
			details = link.closest('tr').next('tr.details-row');

		if (details.is(':hidden')) {
			details.show();
			link.html(closeLabel);
		} else {
			details.hide();
			link.html(openLabel);
		}
	});
	jQuery('table.details tr.details-row .close-details').click(function (e) {
		e.preventDefault();
		jQuery(this).closest('tr.details-row').hide();
	});
}

/*!
 * Simple jQuery Equal Heights
 *
 * Copyright (c) 2013 Matt Banks
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://docs.jquery.com/License
 *
 * @version 1.5.1
 */
(function ($) {

	$.fn.equalHeights = function () {
		var maxHeight = 0,
			$this = $(this);

		$this.each(function () {
			var height = $(this).innerHeight();
			//if ( height > maxHeight ) { maxHeight = height; }
			if (height > maxHeight) {
				maxHeight = height + parseInt($(this).css('border-top-width')) + parseInt($(this).css('border-bottom-width'));
			}
		});

		return $this.css('min-height', maxHeight);
	};

	// auto-initialize plugin
	$('[data-equal]').each(function () {
		var $this = $(this),
			target = $this.data('equal');
		$this.find(target).equalHeights();
	});

})(jQuery);

/* document on key up */

function keyUpEvent(e) {
	if (e.which == 27) {
		if (jQuery('#modal-wrap').is(':visible') && jQuery('.modal:visible').find('.close').length) {
			closeModal(jQuery('.modal:visible'));
		}
	}
}

/* Window resize */

function windowResize() {
	checkBubbleAgentVerticalPosition();
	windowScroll();
	if (!(jQuery('#sidebar-toggler').is(':visible')) && !(jQuery('#modal-wrap').is(':visible'))) {
		jQuery('html')
			.removeClass('modal-open')
			.css({
				'overflow': '',
				'margin-right': 0
			});
		jQuery('body').css('overflow', '');
	} else if (jQuery('#sidebar.open').length) {
		jQuery('html')
			.addClass('modal-open')
			.css({
				'overflow': 'visible',
				'margin-right': scrollbarWidth
			});
		jQuery('body').css('overflow', 'hidden');
	}
}


/* Window scroll */

var scrollTopOld = 0;
function windowScroll() {
	var fromTop = jQuery(window).scrollTop();
	checkBubbleAgentVerticalPosition();

	if ($('.floating-content').length && $('.floating-wrap').length) {
		$('.floating-wrap').each(function () {

			var wrap = $(this),
				wrapOffsetLeft = wrap.offset().left,
				wrapOffsetTop = wrap.offset().top,
				outerWrap = wrap.closest('.wrap'),
				outerWrapOffsetTop = outerWrap.offset().top,
				content = wrap.find('.floating-content'),
				contentOffsetTop = content.offset().top,
				winH = $(window).height(),
				scrollTop = $(window).scrollTop(),
				scrollLeft = $(window).scrollLeft(),
				direction = scrollTop < scrollTopOld ? 'toUp' : 'toDown',
				cssPosition = '',
				cssTop = '',
				cssBottom = '',
				cssMarginTop = '',
				cssMarginBottom = 0,
				cssLeft = '';

			if (wrap.height() > $('#main').height()) {
				return false;
			}

			if (wrapOffsetTop < scrollTop) {
				if (contentOffsetTop + content.outerHeight() >= outerWrapOffsetTop + outerWrap.outerHeight() && !( wrap.hasClass('prev') || wrap.hasClass('next') )) {

					if (contentOffsetTop > scrollTop) {
						cssPosition = 'fixed';
						cssTop = 0;
						cssBottom = 'auto';
						cssMarginTop = '0';
						cssLeft = wrapOffsetLeft - scrollLeft;
						cssClass = 'floating';
					} else {

						cssPosition = 'static';
						cssTop = 'auto';
						cssBottom = 'auto';
						cssMarginTop = parseInt(outerWrap.innerHeight() - parseInt(wrapOffsetTop - outerWrapOffsetTop)) - content.outerHeight() + 1 + 'px';
						cssMarginBottom = parseInt(outerWrap.css('padding-bottom').replace('px', '')) + 1
						cssLeft = '0px';
						cssClass = 'floating';
					}
				} else {

					if (content.height() > winH) {

						if (direction == 'toDown') {
							if (contentOffsetTop + content.outerHeight() + 10 > scrollTop + winH + 3) {
								cssPosition = 'static';
								cssTop = 'auto';
								cssBottom = 'auto';
								cssMarginTop = contentOffsetTop - wrapOffsetTop + 'px';
								cssLeft = '0px';
								cssClass = 'floating';
							} else {
								cssPosition = 'fixed';
								cssTop = 'auto';
								cssBottom = '10px';
								cssMarginTop = '0';
								cssLeft = wrapOffsetLeft - scrollLeft;
								cssClass = 'floating';
							}
						} else {
							if (contentOffsetTop >= scrollTop - 3) {
								cssPosition = 'fixed';
								cssTop = 0;
								cssBottom = 'auto';
								cssMarginTop = '0';
								cssLeft = wrapOffsetLeft - scrollLeft;
								cssClass = 'floating';
							} else {
								cssPosition = 'static';
								cssTop = 'auto';
								cssBottom = 'auto';
								cssMarginTop = contentOffsetTop - wrapOffsetTop + 'px';
								cssLeft = '0px';
								cssClass = 'floating';
							}
						}

					} else {
						cssPosition = 'fixed';
						cssTop = 0;
						cssBottom = 'auto';
						cssMarginTop = '0';
						cssLeft = wrapOffsetLeft - scrollLeft;
						cssClass = 'floating';
					}
				}
			} else {
				cssPosition = 'static';
				cssTop = 'auto';
				cssBottom = 'auto';
				cssMarginTop = '0';
				cssLeft = '0px';
				cssClass = '';
			}

			wrap.css({
				'padding-top': cssMarginTop,
			});

			if (cssClass == '') {
				content.removeClass('floating');
			}

			content
				.addClass(cssClass)
				.css({
					'position': cssPosition,
					'top': cssTop,
					'left': cssLeft,
					'bottom': cssBottom,
					'width': content.parent().width(),
					'margin-bottom': cssMarginBottom * -1 + 'px'
				});

			scrollTopOld = scrollTop;

		})
	}

	/* sidebar toggler */

	if (jQuery('#sidebar-toggler').is(':visible')) {
		var SBT = jQuery('#sidebar-toggler'),
			SBTOffset = SBT.offset()
		if (SBTOffset.top < fromTop) {
			SBT.addClass('floating');
		} else {
			SBT.removeClass('floating');
		}
	}
}

/* FROM JS.JS */

function loginRegisterStatusSuccess(data, portalUrl) {
	window.location.href = portalUrl;
}

function setCookie(name, value, expires, path) {
	var domain = location.hostname.replace("www", "");
	var str = name + '=' + (value);
	str += '; expires=' + expires.toGMTString();
	str += '; path=' + path;
	str += '; domain=' + domain;
	document.cookie = str;
	return true;
}

function getCookie(name) {
	var pattern = "(?:; )?" + name + "=([^;]*);?";
	var regexp = new RegExp(pattern);

	if (regexp.test(document.cookie))
		return decodeURIComponent(RegExp["$1"]);

	return false;
}

function sendVirtualPageview(page) {
	if (typeof ga !== 'undefined') {
		ga('send', 'pageview', page);
	}
}

function removeAllExistingValidationErrors(modalContainer) {
	"use strict";
	jQuery("#failMsg").remove(); //TODO no such id?
	modalContainer.find(".error").removeClass("error");
	modalContainer.find(".field-error").remove();
}

function showFormValidationMessages($form, errors) {
	removeAllExistingValidationErrors($form);
	for (var error in errors) {
		if (errors.hasOwnProperty(error)) {
			$form.find('input[name=' + error + ']').addClass("error").after('<p class="field-error">' + errors[error] + '</p>');
		}
	}
}

function authenticationAjaxProperties($form, url, data) {
	"use strict";
	return {
		type: "POST",
		url: url,
		dataType: 'json',
		data: data || $form.serialize(),
		xhrFields: {
			withCredentials: true
		},
		crossDomain: true
	};
}

function showFailMsg($modalForm, msg) {
	jQuery("#loginFailMsg").remove();
	var m = jQuery("<div>").attr("class", "msg-icon").attr("id", "loginFailMsg");
	m.append(jQuery("<i>").attr("class", "icon icon-cancel"));
	m.append(jQuery("<div>").attr("class", "aligner").append("<p>").text(msg));
	$modalForm.prepend(m);
}

function initAuthenticationFormHandlers() {
	var portalUrl = param.portalUrl;

	jQuery("form input").focus(function () {
		$(this).removeClass("error");
	});

	jQuery("#modal-login").find("form").submit(function (event) {
		event.preventDefault();
		var $form = jQuery(this),
			submitButton = $form.find("input[type=submit]");

		submitButton.attr('disabled', true);

		jQuery.ajax(authenticationAjaxProperties($form, portalUrl + "/ajaxAuthenticate")).done(function (data) {
			if (data.status === "success") {
				loginRegisterStatusSuccess(data, portalUrl);
			} else {
				showFormValidationMessages($form, data.errors);
				submitButton.attr('disabled', false);
			}
		}).fail(function () {
			showFailMsg($form, "We are sorry but something went wrong. Try again in a while.");
			submitButton.attr('disabled', false);
		});

	});

	jQuery("#modal-new-password").find("form").submit(function (event) {
		var $form = jQuery(this);
		event.preventDefault();

		var email = $form.find('#new-mail').val();
		jQuery.ajax(authenticationAjaxProperties($form, portalUrl + "/api/v2/sendPasswordResetEmail")).done(function (data) {
			if (data.status === "success") {
				removeAllExistingValidationErrors($form);
				jQuery('#reset-success').removeClass('hidden');
			} else {
				showFormValidationMessages($form, data.errors);
			}
		}).fail(function () {
			showFailMsg($form, "We are sorry but something went wrong. Try again in a while.");
		});

	});

	jQuery("#custom-payment-form").submit(function (event) {
		event.preventDefault();
		var $form = jQuery(this),
			submitButton = $form.find("input[type=submit]");

		submitButton.attr('disabled', true);

		jQuery.ajax(authenticationAjaxProperties($form, portalUrl + "/processCustomPayment")).done(function (data) {
			if (data.status === "error") {
				showFormValidationMessages($form, data.errors);
				submitButton.attr('disabled', false);
			} else {
				window.location.href = data.redirectUrl;
			}
		}).fail(function () {
			showFailMsg($form, "We are sorry but something went wrong. Try again in a while.");
			submitButton.attr('disabled', false);
		});

	});
}

/* sidebar toggler */

function sidebarToggler() {
	$('#sidebar-toggler').click(function (e) {
		e.preventDefault();
		var html = jQuery('html'),
			body = jQuery('body'),
			sidebar = jQuery('#sidebar'),
			SBT = jQuery('#sidebar-toggler'),
			SBTLink = SBT.find('a'),
			SBTLabel = SBT.find('.label'),
			label = SBTLink.data('label');


		if (sidebar.is(':visible')) {
			html
				.removeClass('modal-open')
				.css({
					'overflow': '',
					'margin-right': 0
				});
			body.css('overflow', '');

		} else {
			html
				.addClass('modal-open')
				.css({
					'overflow': 'visible',
					'margin-right': scrollbarWidth
				});
			body.css('overflow', 'hidden');
		}

		sidebar.toggleClass('open');
		SBT.toggleClass('open');
		SBTLink.data('label', SBTLabel.html());
		SBTLabel.html(label);
	})
}

/* menu toggler */

function menuToggler() {
	jQuery('#menu-toggler').click(function (e) {
		e.preventDefault();
		jQuery('#nav, #user-nav').toggleClass('open');
	});
}

/* scroll to */

function scrollToTarget() {
	jQuery('body').on('click', '[data-scroll-to]', function (e) {
		e.preventDefault();

		var link = jQuery(this),
			target = jQuery(link.data('scroll-to'));

		jQuery('html, body').animate({scrollTop: target.offset().top}, 300);
	});
}

/* Differences tabs */

function openDifferencesTab() {
	var $tabs = jQuery('.difference-tab'),
		$navItems = jQuery('[data-open-tab]');

	$tabs.not('.open').hide();

	jQuery('body').on('click', '[data-open-tab]', function (e) {
		e.preventDefault();

		var $this = jQuery(this),
			tab = $this.data('open-tab');

		if (!$this.hasClass('active')) {
			$navItems.removeClass('active');
			$this.addClass('active');
			$tabs.removeClass('open').hide();
			jQuery(tab).show().addClass('open');
		} else {
			return;
		}
	})
}

function dropdownSubmenu() {
	jQuery('#nav > li.parent > a').each(function () {
		var link = jQuery(this),
			wrap = link.closest('li'),
			list = wrap.find('.submenu'),
			dropdownDelay;

		link
			.mouseover(function () {
				clearTimeout(dropdownDelay);
				dropdownDelay = setTimeout(function () {
					list.fadeIn(150);
					link.addClass('open');
				}, 100);
			});
		wrap
			.mouseout(function () {
				clearTimeout(dropdownDelay);
				dropdownDelay = setTimeout(function () {
					list.fadeOut(150).hide();
					link.removeClass('open');
				}, 300);
			});
		list
			.mouseover(function () {
				clearTimeout(dropdownDelay);
			});
	})
	jQuery('#nav > li.sub > a').each(function () {
		var link = jQuery(this),
			wrap = link.closest('li'),
			list = wrap.find('ul'),
			dropdownDelay;

		link
			.mouseover(function () {
				clearTimeout(dropdownDelay);
				dropdownDelay = setTimeout(function () {
					list.fadeIn(150);
					link.addClass('open');
				}, 100);
			});
		wrap
			.mouseout(function () {
				clearTimeout(dropdownDelay);
				dropdownDelay = setTimeout(function () {
					list.fadeOut(150).hide();
					link.removeClass('open');
				}, 300);
			});
		list
			.mouseover(function () {
				clearTimeout(dropdownDelay);
			});
	})
}

/* content toggle */

function contentToggle() {
	jQuery(document).on('click', '[data-content-toggle]', function (e) {
		e.preventDefault();

		jQuery('body').trigger('contentToggle');

		var link = jQuery(this),
			content = jQuery('#' + link.data('content-toggle'));

		if (content.is(':visible')) {
			content
				.animate({
						"height": "hide",
						"marginTop": "hide",
						"marginBottom": "hide",
						"paddingTop": "hide",
						"paddingBottom": "hide"
					},
					{
						step: function () {
							setTimeout(function () { // hack for flickering
								if (content.closest('[data-equal]').length) {
									$('[data-equal]').each(function () {
										var wrap = content.closest('[data-equal]');
										wrap.find(wrap.data('equal')).css('min-height', 0).equalHeights();
									});
								}
							}, 0);
						},
						duration: 300
					});


			link.removeClass('open');
		} else {
			content
				.removeClass('hidden')
				.hide()
				.animate({
						"height": "show",
						"marginTop": "show",
						"marginBottom": "show",
						"paddingTop": "show",
						"paddingBottom": "show"
					},
					{
						step: function () {
							setTimeout(function () { // hack for flickering
								if (content.closest('[data-equal]').length) {
									$('[data-equal]').each(function () {
										var wrap = content.closest('[data-equal]');
										wrap.find(wrap.data('equal')).css('min-height', 0).equalHeights();
									});
								}
							}, 0);
						},
						duration: 300
					});
			link.addClass('open');
		}
	});
}

/* Box toggle */

function boxToggle() {
	jQuery(document).on('click', '.box > a.header', function (e) {
		e.preventDefault();

		var wrap = jQuery(this).closest('.box'),
			content = wrap.find('.content');

		if (content.is(':visible')) {
			content.slideUp(300);
			wrap.addClass('box-closed');
		} else {
			content.slideDown(300);
			wrap.removeClass('box-closed');
		}
	});

	$('.box.menu .expander').click(function (e) {
		e.preventDefault();
		$(this).closest('.box.menu').toggleClass('open');
	});
}

/* table row click */

function tableRowClick() {
	jQuery('body')
		.on('click', 'tr[data-url]', function () {
			var tr = jQuery(this);
			if (!(tr.data('cancel-nav'))) {
				document.location = tr.data('url');
			}
			tr.data('cancel-nav', false);
		})
		.on('click', 'tr[data-url] a', function () {
			jQuery(this).closest('tr').data('cancel-nav', true);
			//jQuery(this).closest('tr').one('click',function(){ return false; });		
		});
}

function dropdownToggle() {
	jQuery('[data-dropdown-toggle]').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		var link = jQuery(this),
			dropdown = $('#' + link.data('dropdown-toggle'));

		if (dropdown.is(':hidden')) {
			link.addClass('active');
			dropdown.fadeIn(300);
		} else {
			link.removeClass('active');
			dropdown.fadeOut(300);
		}

	});

	jQuery('body').click(function () {
		jQuery('.dropdown').fadeOut(300);
		jQuery('[data-dropdown-toggle]').removeClass('active');
	});
}

/* stack wrap */

function stackWrap() {
	jQuery('.stack-wrap').each(function () {
		var wrap = jQuery(this),
			code = wrap.find('pre'),
			more = wrap.find('.more'),
			less = wrap.find('.less'),
			collapsedStackHeight = 415;

		if (code.height() < collapsedStackHeight) {
			more.hide();
			wrap
				.addClass('short')
				.css('height', 'auto');
		}

		more.click(function (e) {
			e.preventDefault();
			more.hide();
			wrap.animate({
				height: code.height() + 30
			}, 300, function () {
				less.fadeIn(300);
			})
		})
		less.click(function (e) {
			e.preventDefault();
			less.hide();
			wrap.animate({
				height: collapsedStackHeight
			}, 300, function () {
				more.fadeIn(300);
			})
		})
	})
}

function monitorLegend() {
	jQuery('body')
		.on('mouseenter', '.monitor .incidents', function (e) {
			jQuery(this).find('.dropdown').clearQueue().delay(300).fadeIn(300);
		})
		.on('mouseleave', '.monitor .incidents', function (e) {
			jQuery(this).find('.dropdown').clearQueue().delay(300).fadeOut(300);
		});
}

(function ($) {
	$.fn.serializeObject = function () {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
})(jQuery);

function contactSupportForm() {
	jQuery(document).on('submit', '#contact-form', function (e) {
		e.preventDefault();

		var $form = jQuery('#contact-form'),
			fd = new FormData(),
			$file = $form.find('input[type="file"]'),
			$individual_file = $file[0].files[0];

		fd.append('form', $form.serialize());
		fd.append('file', $individual_file);
		fd.append('action', 'ajax_submit_support_contact_form');

		jQuery.ajax({
			type: 'POST',
			url: local.ajaxurl,
			data: fd,
			contentType: false,
			processData: false,
			beforeSend: function () {
				jQuery('#contact-support-send').attr('disabled', 'disabled');
			},
			success: function (response) {
				response = JSON.parse(response);

				if (response.mail) {
					jQuery('#contact-form').hide();
					jQuery('.logged-support-message').show();
				} else {
					jQuery('#contact-form').hide();
					jQuery('.logged-support-error-message').show();
				}
			}
		});
	});
}

/*
 * WP append template part to selector
 */
(function ($) {
	$.fn.appendTemplatePart = function (prefix, sufix) {
		var $this = $(this),
			content;

		sufix = (typeof sufix !== undefined) ? sufix : '';

		$this.each(function () {
			$.ajax({
				type: 'GET',
				url: local.ajaxurl,
				data: {
					action: 'ajax_get_template_part',
					prefix: prefix,
					sufix: sufix
				},
				success: function (html) {
					if (html) {
						$this.html('');
						jQuery(html).appendTo($this);
					}
				},
				error: function (MLHttpRequest, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					jQuery('body').trigger('appendTemplatePartComplete', [prefix, sufix]);
				}
			});
		});
	};
})(jQuery);

/**
 * Send user id to Wordpress on E-mail landing page
 *
 * @param hash
 */
function recordEmailLandingPageFileClick(query) {
	jQuery.ajax({
		type: "POST",
		url: local.ajaxurl,
		dataType: 'json',
		data: {
			action: 'plumbr_ajax_email_campaign_record_file_open',
			data: query
		}
	});
}

function codeLine() {
	$('.code-line .node, .code-line-components li.description')
		.hover(function () {

				var node = $(this),
					wrap = node.closest('.code-line-wrap'),
					lineWrap = wrap.find('.code-line'),
					listWrap = wrap.find('.code-line-components'),
					id = node.closest('.code-line').length ? lineWrap.find('span').index(node) : listWrap.find('li').index(node);

				wrap
					.addClass('description-highlighted')
					.find('.hover')
					.removeClass('hover');
				lineWrap.find('.node:eq(' + id + ')').addClass('hover');
				listWrap.find('li.description:eq(' + id + ')').addClass('hover');


			},
			function () {
				$(this).closest('.code-line-wrap').removeClass('description-highlighted').find('.hover').removeClass('hover');
			})
}

function addFormError($formControl, errorMsg) {
	$formControl.addClass('error').after('<p class="field-error">' + errorMsg + '</p>');
	jQuery("label[for='" + $formControl.attr('id') + "']").addClass('error');
}

function removeFormError($formControl) {
	$formControl.removeClass('error').next('.field-error').remove();
	jQuery("label[for='" + $formControl.attr('id') + "']").removeClass('error');
}

function validateForm($form) {
	var valid = true;

	$form.find('[required]').each(function () {
		if (!$(this).val()) {
			valid = false;
			if (!$(this).hasClass('error')) {
				addFormError($(this), "Required field!");
			}
		} else {
			removeFormError($(this));
		}
	});

	$form.find('select[required]').each(function () {
		if ($(this).val() === "default") {
			valid = false;
			if (!$(this).hasClass('error')) {
				addFormError($(this), "Required field!");
			}
		} else {
			removeFormError($(this));
		}
	});

	$form.find('[type=email]').each(function () {
		if (/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val())) {
			removeFormError($(this));
		} else {
			valid = false;
			if (!$(this).hasClass('error')) {
				addFormError($(this), "The e-mail format seems to be invalid!");
			}
		}
	});

	return valid;
}

function submitForm(attr) {
	jQuery.ajax({
		type: "POST",
		url: local.ajaxurl,
		dataType: 'json',
		data: {
			action: attr.action,
			data: attr.$form.serializeObject(),
			queryParameters: jQuery.getQueryParameters()
		}
	})
		.done(function (response) {
			attr.callback(response);
		});
}

$.fn.serializeObject = function () {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function () {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

/*
 * Get Search params from URL
 *
 * @source https://github.com/youbastard/jquery.getQueryParameters
 * @author Nicholas Ortenzio
 */
jQuery.extend({
	getQueryParameters: function (str) {
		return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function (n) {
			return n = n.split("="), this[n[0]] = n[1], this
		}.bind({}))[0];
	}
});

function screenShotGalery() {
	jQuery('#toggle-gallery').click(function (e) {
		console.log('click');
		e.preventDefault();
		jQuery('.gallery').toggle();
	});

	jQuery('.gallery').find('.close').click(function (e) {
		e.preventDefault();
		jQuery('.gallery').hide();
	});
}

function setupTimezones() {
	$('.tz-js').removeClass('hidden');

	var tzPicker = $('#register-timezone'),
		tz = jstz.determine().name();

	tzPicker.val(tz);

	var blood = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.nonword,
		queryTokenizer: Bloodhound.tokenizers.nonword,
		local: window.timezones.timeZones
	});

	tzPicker.typeahead({
		hint: true,
		highlight: true
	}, {
		name: 'timezones',
		limit: 100,
		source: blood
	});
}

/* DOM loaded */
jQuery(function () {
	boxToggle();
	contentToggle();
	windowScroll();
	jQuery(window)
		.mousemove(function (e) {
			checkBubbleAgentHorizontalPosition(e);
		})
		.scroll(windowScroll)
		.resize(windowResize);

	jQuery('.tabs-wrap').tabs();
	jQuery('#download .tabs-wrap, .tabs-wrap.closed').tabs({
		collapsible: true,
		beforeActivate: function (event, ui) {
			if (ui.newTab.length) {
				if (jQuery(ui.newTab).find('a').attr('href').indexOf('#') !== 0) {
					window.open(jQuery(ui.newTab).find('a').attr('href'), '_self');
					return false;
				}
			}
		},
		active: false,
		activate: function (event, ui) {
			jQuery('html, body').animate({scrollTop: jQuery('#download .tabs-wrap, .tabs-wrap.closed').offset().top});
		}
	});

	/* FROM JS.JS */
	//referer handling & persisting
	var separator = " $$$ ";
	var plumbrCookie = getCookie('plumbr_cookie');

	if (!plumbrCookie) {
		var url = document.URL;
		var referer = document.referrer;

		var expirationDate = new Date();
		expirationDate.setMonth(expirationDate.getYear() + 1);
		setCookie('plumbr_cookie', referer + separator + url, expirationDate, "/");
	}

	/* END */

	modals();
	modalPanel();
	dropdownSubmenu();
	detailsTable();
	initAuthenticationFormHandlers();
	tableRowClick();
	dropdownToggle();
	scrollToTarget();
	stackWrap();
	monitorLegend();
	openDifferencesTab();
	codeLine();
	menuToggler();
	sidebarToggler();
	setupTimezones();

	screenShotGalery();

	jQuery(document).keyup(function (e) {
		keyUpEvent(e);
	});

	if (local.isSupportIndex) {
		jQuery('body').on('userInfoArrived', function () {
			jQuery('.js-contact-support').appendTemplatePart('blocks/support', 'contact-form');
		});
		jQuery('body').on('userInfoDidNotArrive', function () {
			jQuery('.js-contact-support').appendTemplatePart('blocks/support', 'start-trial');
		});
	}

	if (local.isSupportType || local.isSearch) {
		jQuery('body').on('userInfoArrived', function () {
			jQuery('.js-contact-support').appendTemplatePart('blocks/support-sidebar', 'contact-form');
		});
	}


	if (local.isSupportIndex || local.isSupportType || local.isSearch) {
		jQuery('body').on('appendTemplatePartComplete', function (event, prefix, sufix) {
			if (sufix === 'contact-form' && user) {
				jQuery('#contact-form').find('[name=email]').val(user.username);
			}
		});

		jQuery('body').on('contentToggle', function () {
			jQuery('.logged-support-message').hide();
			jQuery('#contact-support-send').attr('disabled', false);
		});

		contactSupportForm();
	}

	if (local.isEmailLandingPage) {
		jQuery('[data-record-file-click]').on('click', function (e) {
			recordEmailLandingPageFileClick(jQuery.getQueryParameters());
		});

		jQuery('#form-handbook').on('submit', function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (validateForm($(this))) {
				submitForm({
					$form: $(this),
					action: 'plumbr_ajax_submit_email_handbook_form',
					callback: function (response) {
						if (response.db === 1) {
							$('#handbook-form').hide();
							$('#handbook-links').removeClass('hidden');
						}
					}
				});
			}
		});
	}

	//syntax highlighting for plog post java code snipets
	if (typeof prettyPrint !== 'undefined') {
		prettyPrint();
	}

	jQuery('.introduction').each(function () {
		jQuery(this).find('[class*="col"]').equalHeights();
	});

});
</script>
<br>
### Full GC

<br>
## Parallel GC

<br>
## Concurrent Mark and Sweep

## G1