document.addEventListener('DOMContentLoaded', () => {
  // Event delegation for handling clicks on elements with .delete-btn class
  document.body.addEventListener('click', function (event) {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
      event.preventDefault();
      
      const url = deleteButton.dataset.url;
      const entity = deleteButton.dataset.entity || 'data';

      if (!url) {
        console.error('Delete button must have a data-url attribute.');
        return;
      }

      Swal.fire({
        title: `Anda yakin?`,
        text: `Anda akan menghapus ${entity} ini. Aksi ini tidak dapat dibatalkan!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(url, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              Swal.fire(
                'Dihapus!',
                `${entity} telah dihapus.`,
                'success'
              ).then(() => {
                window.location.reload();
              });
            } else {
              Swal.fire(
                'Gagal!',
                data.message || `Terjadi kesalahan saat menghapus ${entity}.`,
                'error'
              );
            }
          })
          .catch(error => {
            Swal.fire(
              'Gagal!',
              'Tidak dapat terhubung ke server.',
              'error'
            );
          });
        }
      });
    }
  });

  // Event delegation for handling submissions of forms with .ajax-form class
  document.body.addEventListener('submit', function (event) {
    const form = event.target;
    if (form.classList.contains('ajax-form')) {
      event.preventDefault();

      const url = form.dataset.url || form.action;
      const method = form.dataset.method || form.method;
      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());

      fetch(url, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const modalElement = form.closest('.modal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
          
          Swal.fire(
            'Berhasil!',
            data.message,
            'success'
          ).then(() => {
            const redirectUrl = form.dataset.redirectUrl || window.location.pathname;
            window.location.href = redirectUrl;
          });
        } else {
          Swal.fire(
            'Gagal!',
            data.message || 'Terjadi kesalahan.',
            'error'
          );
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);
        Swal.fire(
          'Gagal!',
          'Terjadi kesalahan saat mengirim data.',
          'error'
        );
      });
    }
  });
});
