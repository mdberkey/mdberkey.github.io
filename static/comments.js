// Blog integration for blog-comments. Fetches the fragment, swaps it in,
// submits forms with X-Fragment: 1, and loads reply forms without navigation.
(() => {
  'use strict';

  const AUTHOR_KEY = 'blog-comments-author';
  let root = document.querySelector('#comments[data-src]');
  if (!root) return;

  const src = root.dataset.src;
  const embedUrl = new URL(src, location.href);
  const origin = embedUrl.origin;
  const page = embedUrl.searchParams.get('page') || location.pathname;
  // The service may live under a path prefix (e.g. /comments). The embed URL
  // always ends in /embed, so everything before that is the service root.
  const serviceBase = embedUrl.pathname.replace(/\/embed$/, '');
  const embedPath = serviceBase + '/embed';
  const commentUrl = origin + serviceBase + '/comment';

  // The service renders every timestamp in UTC. Rewrite them in the browser so
  // the reader's timezone never leaves their machine.
  const timeFormat = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  function localizeTimes() {
    if (!root) return;
    root.querySelectorAll('time[datetime]').forEach((el) => {
      const date = new Date(el.getAttribute('datetime'));
      if (Number.isNaN(date.getTime())) return;
      if (!el.dataset.utc) el.dataset.utc = el.textContent;
      el.textContent = timeFormat.format(date);
      el.title = el.dataset.utc;
    });
  }

  // Storage can be blocked outright (privacy settings, private mode). Losing
  // the saved name must not break the widget.
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
      // Remembering the name is a convenience, not a requirement.
    }
  }

  function bind() {
    if (!root) return;
    localizeTimes();
    root.querySelectorAll('form.comment-form').forEach((form) => {
      // The native fallback must post to the service, not the blog origin.
      form.action = commentUrl;
      const author = form.querySelector('input[name="author"]');
      const saved = readAuthor();
      if (author && !author.value && saved) author.value = saved;
      form.addEventListener('submit', onSubmit);
    });
    // Reply and cancel both point at the service's /embed endpoint. Keep them
    // in the widget instead of navigating the blog to a bare fragment.
    root.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.getAttribute('href'), origin);
      if (url.origin !== origin || url.pathname !== embedPath) return;
      link.href = url.toString();
      link.addEventListener('click', onInlineLink);
    });
    // The service points timestamps at its standalone page. Keep the permalink
    // on the post instead, so clicking one stays on the blog.
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

  // Images and the video above the comments keep resizing the page while they
  // load, which moves the target. Re-run the jump until the layout settles.
  function scrollToHashWhenSettled() {
    scrollToHash();
    window.addEventListener('load', scrollToHash, { once: true });
    if (document.fonts) document.fonts.ready.then(scrollToHash);
    setTimeout(scrollToHash, 600);
  }

  // Only the newest request may repaint the section. Without this, a slow
  // reply fetch can land after a cancel and put the form back.
  let requestSeq = 0;
  let submitting = false;

  function swap(html) {
    if (!root) return false;
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const next = parsed.querySelector('#comments');
    // Never replace the widget with an error page or an empty body.
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
        // The request never reached the service. Let the browser post the
        // form itself so the comment is not lost.
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
        // Held for moderation, or the id was not rendered: no anchor to point at.
        history.replaceState(null, '', '#comments');
      }
    } catch (error) {
      // The request succeeded but the body did not arrive intact.
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
