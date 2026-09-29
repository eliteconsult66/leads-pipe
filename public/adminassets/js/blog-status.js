document.addEventListener('click', async (e) => {

    const btn = e.target.closest('.status-btn');

    if (!btn) return;

    try {

        const response = await fetch(
            btn.dataset.url,
            {
                method: 'POST'
            }
        );

        const data = await response.json();

        if (data.success) {

            btn.classList.toggle('flipped');

        }

    } catch (error) {

        console.error('Status update failed:', error);

    }

});