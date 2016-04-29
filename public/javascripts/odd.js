$(document).ready(function() {
  //初始胜平负
  var initial_vs = 0;
  var initial_es = 0;
  var initial_ls = 0;
  //即时胜平负
  var now_vs = 0;
  var now_es = 0;
  var now_ls = 0;
  var trList = $('.odds').find('tr');
  trList.each(function(index, element) {
    if (index < trList.length - 1) {
      var tdArr = $(this).find('span');
      initial_vs += parseFloat(tdArr.eq(0).html());
      initial_es += parseFloat(tdArr.eq(1).html());
      initial_ls += parseFloat(tdArr.eq(2).html());
      now_vs += parseFloat(tdArr.eq(3).html());
      now_es += parseFloat(tdArr.eq(4).html());
      now_ls += parseFloat(tdArr.eq(5).html());
    }
  });
  var length = trList.length - 1;
  var oddsArr = [initial_vs, initial_es, initial_ls, now_vs, now_es, now_ls];
  //计算平均值
  trList.eq(trList.length - 1).find('span').each(function(index, el) {
    var average = (oddsArr[index] / length).toFixed(2);
    $(this).text(average);
  });
});
