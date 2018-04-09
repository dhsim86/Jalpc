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





