"use strict";

function testWebP(callback) {
  var webP = new Image();

  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };

  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {
  if (support == true) {
    document.querySelector('body').classList.add('webp');
  } else {
    document.querySelector('body').classList.add('no-webp');
  }
});

function price_format(n) {
  c = 0;
  d = '.'; // decimal separator

  t = ''; // thousands separator

  s_left = '';
  s_right = '';
  n = n * 1.00000000; //sign = (n < 0) ? '-' : '';
  //extracting the absolute value of the integer part of the number and converting to string

  i = parseInt(n = Math.abs(n).toFixed(c)) + '';
  j = (j = i.length) > 3 ? j % 3 : 0;
  return s_left + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '') + s_right;
}

function calculate_tax(price) {
  return price;
}

function process_discounts(price, quantity) {
  return price;
}

animate_delay = 20;
main_price_final = calculate_tax(Number($('#formated_price').attr('price')));
main_price_start = calculate_tax(Number($('#formated_price').attr('price')));
main_step = 0;
main_timeout_id = 0;

function animateMainPrice_callback() {
  main_price_start += main_step;

  if (main_step > 0 && main_price_start > main_price_final) {
    main_price_start = main_price_final;
  } else if (main_step < 0 && main_price_start < main_price_final) {
    main_price_start = main_price_final;
  } else if (main_step == 0) {
    main_price_start = main_price_final;
  }

  $('#formated_price').html(price_format(main_price_start));

  if (main_price_start != main_price_final) {
    main_timeout_id = setTimeout(animateMainPrice_callback, animate_delay);
  }
}

function animateMainPrice(price) {
  main_price_start = main_price_final;
  main_price_final = price;
  main_step = (main_price_final - main_price_start) / 10;
  clearTimeout(main_timeout_id);
  main_timeout_id = setTimeout(animateMainPrice_callback, animate_delay);
}

function recalculateprice() {
  var main_price = Number($('#formated_price').attr('price'));
  var input_quantity = Number($('input[name="quantity"]').val());
  var special = Number($('#formated_special').attr('price'));
  var tax = 0;
  if (isNaN(input_quantity)) input_quantity = 0; // Process Discounts.

  main_price = process_discounts(main_price, input_quantity);
  tax = process_discounts(tax, input_quantity);
  var option_price = 0;
  $('input:checked,option:selected').each(function () {
    if ($(this).attr('price_prefix') == '=') {
      option_price += Number($(this).attr('price'));
      main_price = 0;
      special = 0;
    }
  });
  $('input:checked,option:selected').each(function () {
    if ($(this).attr('price_prefix') == '+') {
      option_price += Number($(this).attr('price'));
    }

    if ($(this).attr('price_prefix') == '-') {
      option_price -= Number($(this).attr('price'));
    }

    if ($(this).attr('price_prefix') == 'u') {
      pcnt = 1.0 + Number($(this).attr('price')) / 100.0;
      option_price *= pcnt;
      main_price *= pcnt;
      special *= pcnt;
    }

    if ($(this).attr('price_prefix') == '*') {
      option_price *= Number($(this).attr('price'));
      main_price *= Number($(this).attr('price'));
      special *= Number($(this).attr('price'));
    }
  });
  special += option_price;
  main_price += option_price;
  tax = main_price; // Process TAX.

  main_price = calculate_tax(main_price);
  special = calculate_tax(special); // Раскомментировать, если нужен вывод цены с умножением на количество
  // main_price *= input_quantity;
  // special *= input_quantity;
  // tax *= input_quantity;
  // Display Main Price
  //$('#formated_price').html( price_format(main_price) );

  animateMainPrice(main_price);
}

$(document).ready(function () {
  $('input[type="checkbox"]').bind('change', function () {
    recalculateprice();
  });
  $('input[type="radio"]').bind('change', function () {
    recalculateprice();
  });
  $('select').bind('change', function () {
    recalculateprice();
  });
  $quantity = $('input[name="quantity"]');
  $quantity.data('val', $quantity.val());

  (function () {
    if ($quantity.val() != $quantity.data('val')) {
      $quantity.data('val', $quantity.val());
      recalculateprice();
    }

    setTimeout(arguments.callee, 250);
  })();

  recalculateprice();
});