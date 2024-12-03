// Get references to DOM elements
const form = document.getElementById('item-form');
const itemList = document.getElementById('items');

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const itemName = document.getElementById('item-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const category = document.getElementById('category').value;

    // Create new list item
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <strong>${itemName}</strong> - <em>${category}</em> (expires: ${expiryDate})
        <button class="share-btn">Share</button>
    `;

    listItem.querySelector('.share-btn').addEventListener('click', () => {
        alert(`Sharing ${itemName} with the community!`);
    });

    itemList.appendChild(listItem);

    form.reset();
});

setInterval(() => {
    const now = new Date().toISOString().split('T')[0]; // Today's date
    document.querySelectorAll('li').forEach((item) => {
        const expiry = item.textContent.match(/expires: (\d{4}-\d{2}-\d{2})/)[1];
        if (expiry === now) {
            item.style.color = 'red';
            alert(`The item "${item.textContent.split(' - ')[0]}" is about to expire!`);
        }
    });
}, 10000); 
