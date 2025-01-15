//Fonction de calcul de moyenne des valeurs d'un tableau

module.exports = function average(array) {
  let sum = 0;

  array.map((num) => {
    sum += num;
  });

  return (sum / array.length).toFixed(1);
};
