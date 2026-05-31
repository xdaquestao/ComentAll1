const API_URL = '/api/github';

let currentLikes = 0;
let userLiked = false;

async function loadData() {
  try {
    const res = await fetch(API_URL);
    const { issue, comments, reactions } = await res.json();

    // Renderizar post
    document.getElementById('post-title').textContent = issue.title;
    document.getElementById('post-body').textContent = issue.body;

    // Contar likes
    currentLikes = reactions.filter(r => r.content === 'heart').length;
    document.getElementById('like-count').textContent = currentLikes;

    // Renderizar comentários
    document.getElementById('comment-count').textContent = `(${comments.length})`;
    const commentsList = document.getElementById('comments-list');

    if (comments.length === 0) {
      commentsList.innerHTML = '<p class="loading">Seja o primeiro a comentar!</p>';
      return;
    }

    commentsList.innerHTML = comments.map(comment => `
      <div class="comment">
        <img src="${comment.user.avatar_url}" alt="${comment.user.login}">
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${comment.user.login}</span>
            <span class="comment-date">${new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="comment-body">${comment.body}</div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar:', error);
    document.getElementById('comments-list').innerHTML = '<p class="loading">Erro ao carregar comentários</p>';
  }
}

// Curtir
document.getElementById('like-btn').addEventListener('click', async () => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'react' })
    });
    currentLikes++;
    document.getElementById('like-count').textContent = currentLikes;
    document.getElementById('like-btn').classList.add('liked');
  } catch (error) {
    alert('Erro ao curtir. Você precisa configurar o GITHUB_TOKEN.');
  }
});

// Comentar
document.getElementById('comment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('comment-input');
  const body = input.value.trim();

  if (!body) return;

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'comment', body })
    });
    input.value = '';
    loadData();
  } catch (error) {
    alert('Erro ao comentar. Verifique se o GITHUB_TOKEN está configurado.');
  }
});

// Carregar ao iniciar
loadData();
