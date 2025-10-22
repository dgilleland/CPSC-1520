// initial values
let skip = 3;
let message = "";
let numbers = [];
// <step>
for (let index = skip; index <= 10; index += skip) {
  numbers.push(index);
}
message = `Skip by ${skip}: ${numbers.join(', ')}`;
// </step>

console.log(message);
