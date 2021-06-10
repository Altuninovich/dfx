function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

const addressParam = findGetParameter("address");

if (addressParam) {
  if (addressParam.startsWith("0x") && addressParam.length === 42) {
    $("#input-address").val(addressParam);
  } else {
    $("#alert-wrong-address").show();
  }
}
