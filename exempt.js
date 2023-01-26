function calculate() {
  var q1 = document.getElementById('q1').value;
  var q2 = document.getElementById('q2').value;
  var mex = document.getElementById('mex').value;
  var q3 = document.getElementById('q3').value;
  var q4 = document.getElementById('q4').value;

  if (typeof(q1) != 'number')
    q1 = parseInt(q1);
  if (typeof(q2) != 'number')
    q2 = parseInt(q2);
  if (typeof(mex) != 'number')
    mex = parseInt(mex);
  if (typeof(q3) == 'string' && q3.trim().length == 0)
    q3 = null;
  else if (typeof(q3) != 'number')
    q3 = parseInt(q3);
  if (typeof(q4) == 'string' && q4.trim().length == 0)
    q4 = null;
  else if (typeof(q4) != 'number')
    q4 = parseInt(q4);

  var errorMessage = '';
  if (isNaN(q1) || q1 < 0 || q1 > 100)
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Invalid quarter 1 grade.';
  if (isNaN(q2) || q2 < 0 || q2 > 100)
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Invalid quarter 2 grade.';
  if (isNaN(mex) || mex < 0 || mex > 100)
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Invalid midyear exam grade.';
  if (q3 != null && (isNaN(q3) || q3 < 0 || q3 > 100))
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Invalid quarter 3 grade.';
  if (q4 != null && (isNaN(q4) || q4 < 0 || q4 > 100))
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Invalid quarter 4 grade.';
  
  if (q1 == null || q2 == null || mex == null)
    errorMessage += ((errorMessage.length == 0) ? '' : ' ') + 'Grades for quarter 1, 2, and midyear exam are required.';
  
  if (errorMessage.length != 0) {
    document.getElementById('output').innerHTML = errorMessage;
    return false;
  }

  var output = '';
  if (q3 != null && q4 != null) {
    var avg = Math.round((2.0*(q1 + q2 + q3 + q4) + mex) / 9.0);
    output = 'Your average grade is <b>' + avg + '</b>. This means you are ' + ((avg >= 90) ? '' : 'not ') + 'exempt from the final exam.';
  } else if (q3 != null) {
    // 89.5 = (2*(q1 + q2 + q3 + q4) + mex) / 9
    // (89.5*9) = 2*(q1 + q2 + q3 + q4) + mex 
    // (89.5*9) = 2*(q1 + q2 + q3) + 2*q4 + mex 
    // (89.5*9) - 2*(q1 + q2 + q3) - mex) = 2*q4 
    var q4Min = Math.ceil((89.5*9.0 - 2.0*(q1 + q2 + q3) - mex) / 2.0);
    output = 'The minimum grade for quarter 4 is <b>' + q4Min + '</b> in order to be exempt from the final exam.';
    if (q4Min > 99)
      output += ' This is not possible.';
  } else {
    var q34Min = Math.ceil((89.5*9.0 - 2.0*(q1 + q2) - mex) / 2.0);
    output = 'For quarters 3 and 4 combined, you need to achieve a total grade of <b>' + q34Min + '</b> points to be exempt from the final exam.';
    if (q34Min > 2*99)
      output += ' This is not possible.';
  }

  document.getElementById('output').innerHTML = output;
  return false;
}
