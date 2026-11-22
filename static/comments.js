// Blog integration for blog-comments.
(() => {
  'use strict';

  const AUTHOR_KEY = 'blog-comments-author';
  let root = document.querySelector('#comments[data-src]');
  if (!root) return;

  const src = root.dataset.src;
  const embedUrl = new URL(src, location.href);
  const origin = embedUrl.origin;
  const page = embedUrl.searchParams.get('page') || location.pathname;
  // The service may live under a path prefix (e.g. /comments).
  const serviceBase = embedUrl.pathname.replace(/\/embed$/, '');
  const embedPath = serviceBase + '/embed';
  const commentUrl = origin + serviceBase + '/comment';

  // The service renders UTC; show the reader's local time as MM-DD-YYYY h:mm am.
  const pad = (value) => String(value).padStart(2, '0');

  function formatLocal(date) {
    const hours = date.getHours();
    const hour = hours % 12 || 12;
    const suffix = hours < 12 ? 'am' : 'pm';
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ${hour}:${pad(date.getMinutes())} ${suffix}`;
  }

  function localizeTimes() {
    if (!root) return;
    root.querySelectorAll('time[datetime]').forEach((el) => {
      const date = new Date(el.getAttribute('datetime'));
      if (Number.isNaN(date.getTime())) return;
      if (!el.dataset.utc) el.dataset.utc = el.textContent;
      el.textContent = formatLocal(date);
      el.title = el.dataset.utc;
    });
  }

  // Storage can be blocked; losing the saved name must not break the widget.
  function readAuthor() {
    try {
      return localStorage.getItem(AUTHOR_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveAuthor(name) {
    try {
      localStorage.setItem(AUTHOR_KEY, name);
    } catch (error) {
      // Remembering the name is optional.
    }
  }

  function bind() {
    if (!root) return;
    localizeTimes();
    root.querySelectorAll('form.comment-form').forEach((form) => {
      form.action = commentUrl;
      const author = form.querySelector('input[name="author"]');
      const saved = readAuthor();
      if (author && !author.value && saved) author.value = saved;
      form.addEventListener('submit', onSubmit);
    });
    // Keep reply and cancel links inside the widget.
    root.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.getAttribute('href'), origin);
      if (url.origin !== origin || url.pathname !== embedPath) return;
      link.href = url.toString();
      link.addEventListener('click', onInlineLink);
    });
    // Keep timestamp permalinks on the post.
    root.querySelectorAll('a.comment-time').forEach((link) => {
      const comment = link.closest('li[id^="c"]');
      if (comment) link.href = '#' + comment.id;
    });
  }

  function scrollToHash() {
    const match = /^#(c\d+)$/.exec(location.hash);
    if (!match) return;
    const target = document.getElementById(match[1]);
    if (target) target.scrollIntoView({ block: 'center' });
  }

  // Media above the comments keeps resizing the page after load.
  function scrollToHashWhenSettled() {
    scrollToHash();
    window.addEventListener('load', scrollToHash, { once: true });
    if (document.fonts) document.fonts.ready.then(scrollToHash);
    setTimeout(scrollToHash, 600);
  }

  // Only the newest request may repaint the section.
  let requestSeq = 0;
  let submitting = false;

  function swap(html) {
    if (!root) return false;
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const next = parsed.querySelector('#comments');
    if (!next) return false;
    root.replaceWith(next);
    root = next;
    bind();
    return true;
  }

  function showError(message) {
    if (!root) return;
    root.querySelectorAll('.comments-error-general').forEach((el) => el.remove());
    const note = document.createElement('p');
    note.className = 'comments-error-general';
    note.setAttribute('role', 'alert');
    note.textContent = message;
    root.prepend(note);
  }

  async function load(url) {
    const seq = ++requestSeq;
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) throw new Error('comments unavailable');
    const html = await response.text();
    if (seq !== requestSeq) return;
    if (!swap(html)) throw new Error('unexpected fragment');
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    const seq = ++requestSeq;
    submitting = true;
    if (button) button.disabled = true;
    try {
      let response = null;
      try {
        response = await fetch(commentUrl, {
          method: 'POST',
          body: data,
          credentials: 'omit',
          headers: { 'X-Fragment': '1' },
        });
      } catch (error) {
        // Let the browser post natively if fetch never reached the service.
        form.removeEventListener('submit', onSubmit);
        form.submit();
        return;
      }
      if (!response.ok) {
        showError('Posting failed. Try again.');
        return;
      }
      const author = String(data.get('author') || '').trim();
      if (author) saveAuthor(author);
      const id = response.headers.get('X-Comment-Id');
      const html = await response.text();
      if (seq !== requestSeq) return;
      if (!swap(html)) {
        showError('Your comment may have been posted. Reload the page to check.');
        return;
      }
      const posted = id && root ? root.querySelector('#c' + id) : null;
      if (posted) {
        posted.scrollIntoView({ block: 'center' });
        history.replaceState(null, '', '#c' + id);
      } else {
        history.replaceState(null, '', '#comments');
      }
    } catch (error) {
      showError('Your comment may have been posted. Reload the page to check.');
    } finally {
      submitting = false;
      if (button) button.disabled = false;
    }
  }

  async function onInlineLink(event) {
    event.preventDefault();
    const link = event.currentTarget;
    try {
      await load(link.href);
      if (root) root.scrollIntoView({ block: 'start' });
    } catch (error) {
      showError('Could not load that. Try again.');
    }
  }

  function showOffline() {
    if (!root) return;
    const heading = document.createElement('h2');
    heading.className = 'comments-heading';
    heading.textContent = 'comments';
    const note = document.createElement('p');
    note.className = 'comments-notice comments-offline';
    note.textContent = 'Comments are offline right now. X_X';
    root.replaceChildren(heading, note);
  }

  load(src)
    .then(scrollToHashWhenSettled)
    .catch(showOffline);
})();
