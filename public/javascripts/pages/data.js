(function(window) {

  // vars

  var $ = window.jQuery;
  var document = window.document;
  var list, headTpl, bodyTpl;
  var tableHeadEl = document.getElementById('data-table-head');
  var tableBodyEl = document.getElementById('data-table-body');
  var panelEl = document.getElementById('data-panel');
  var messageEl = document.getElementById('data-message');
  var exportEl = document.getElementById('data-export');
  var exportModalEl = document.getElementById('export-modal');
  var exportExcelEl = document.getElementById('export-excel');
  var exportCsvEl = document.getElementById('export-csv');
  var dataFields = [];
  var data = [];
  var _ = window.i18n.t.bind(window.i18n);

  // functions

  function buildList() {
    var headItems = [];
    var bodyItems = [];
    for (var i=0,ln=dataFields.length; i<ln; i++) {
      headItems.push('<th>'+dataFields[i]+'</th>');
      bodyItems.push('<td data-'+dataFields[i]+'></td>');
    }
    headTpl = '<tr>'+headItems.join('')+'<th>&nbsp;</td></tr>';
    bodyTpl = '<tr>'+bodyItems.join('')+'<td><a href="#" data-remove title="'+_('Remove')+'"><span class="glyphicon glyphicon-minus-sign"></span></a></td></tr>';
    tableHeadEl.innerHTML = headTpl;
    list = new DataList(
      tableBodyEl,
      data,
      bodyTpl
    );
    list.dummyTagName = 'TBODY';
    list.populateItemDataFn = function(itemEl, itemData) {
      var tdEl;
      itemEl.setAttribute('data-id', itemData._id);
      for (var i=0,ln=dataFields.length; i<ln; i++) {
        tdEl = itemEl.querySelector('[data-'+dataFields[i]+']');
        if (! tdEl) {
          return;
        }
        if (dataFields[i] === 'date') {
          itemData[dataFields[i]] = new Date(itemData.dateUnixtime);
        }
        if (typeof itemData[dataFields[i]] !== 'undefined') {
          tdEl.innerHTML = itemData[dataFields[i]];
        } else {
          tdEl.innerHTML = '<small>'+_('n/a')+'</small>';
        }
      }
    };
  }

  function showMessage(message, type) {
    type = type || 'info';
    $(messageEl).removeClass().addClass('alert alert-'+type).html(message).show();
  }

  function hideMessage() {
    $(messageEl).hide();
  }

  function removeData(id) {
    return $.ajax({
      url: '/data/'+id,
      type: 'DELETE'
    });
  }

  // handlers

  $(tableBodyEl).on('click', '[data-remove]', function() {
    var itemEl = $(this).parents('tr');
    removeData(itemEl.attr('data-id')).then(function() {
      itemEl.remove();
    });
    return false;
  });

  $(exportEl).on('click', function() {
    $(exportModalEl).modal('show');
    return false;
  });

  $(exportExcelEl).on('click', function() {
    window.open('/d/'+window.giot.user.apiKey+'/excel');
    return false;
  });

  $(exportCsvEl).on('click', function() {
    return false;
  });

  $.subscribe('dataFieldsUpdated', function(event, items) {
    dataFields = items;
    buildList();
    if (dataFields.length === 0) {
      $(panelEl).hide();
      showMessage(_('You need to send data first for initialize fields. <a href="https://github.com/jmas/charttty/wiki">How to do this</a>'), 'info');
    } else {
      hideMessage();
    }
  });

  $.subscribe('dataUpdated', function(event, items) {
    data = items.concat(data);
    setTimeout(function() {
      list.update(data);
    },1);
    if (dataFields.length === 0) {
      $(panelEl).hide();
    } else {
      $(panelEl).show();
    }
  });

})(this);
