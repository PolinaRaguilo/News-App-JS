// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '6a4861822f4b483ea5adc791970c291e';
  const apiURL = 'http://newsapi.org/v2';

  return {
    topHeadlines(country = 'ua', cb) {
      http.get(`${apiURL}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiURL}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];


form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});


//функция для загрузки новостей

function loadNews() {
  showPreloader();
  const country = countrySelect.value;
  const searchText = searchInput.value;



  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }


}

//функция для обработки данных после поучения их с сервиса
function onGetResponse(err, res) {

  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  if (!res.articles.length) {
    //show empty message(если новостей не найдено)
    return;

  }


  showNews(res.articles);
}

//функция для вывода новостей
function showNews(news) {
  const newsContainer = document.querySelector('.news-container .row'); //контейнер, куда будем закидывать наши новости

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = ' ';

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem); //создавать разметку будем с помощью разных функций(смотри ниже)
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//функция для поkeчения одной новости (для отображения одной новости(разметка одной новости))
function newsTemplate({
  urlToImage,
  title,
  url,
  description
}) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({
    html: msg,
    classes: type
  });
}
//для очистки контейнера от новостей
function clearContainer(container) {

  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//прелоадэр
function showPreloader() {
  document.body.insertAdjacentHTML('afterbegin', `<div class="progress">
  <div class="indeterminate"></div>
</div>`);
}

//скрывать прелоадэр
function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}