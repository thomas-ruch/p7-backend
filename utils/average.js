module.exports = function average(array) {
  let sum = 0;

  array.map((num) => {
    sum += num;
  });

  return sum / array.length;
};
