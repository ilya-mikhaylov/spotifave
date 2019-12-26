const createPlaylistButton = document.querySelector('.create-playlist-btn');

    createPlaylistButton.addEventListener('click', async (event) => {
        console.log('>>> OK');
        event.preventDefault();
        event.stopPropagation();
        await fetch('/dashboard', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({operation: 'top20songs'})
        }).then(data =>  {
            if(data) {
                alert('Playlist created');
                redirect: window.location.replace("/")
            } else{
                alert("Ошибочка");
            }
        });
    });