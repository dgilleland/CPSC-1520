console.log('JavaScript file loaded!');
let feedback = document.getElementById('feedback');

const handleClick = function(event) {
    // TODO: Use for exploration purposes
    const target = event.target;
    feedback.innerText = `Clicked from ${target.tagName}`;
}

let heading = document.querySelector('h1');
heading.addEventListener('click', handleClick);

// TODO: Complete the rest of the tutorial
