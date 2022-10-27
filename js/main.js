const weatherApi = () => {
    navigator.geolocation.getCurrentPosition(async (position)=> {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        let weather= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8f79f195073fde254a11c5208634d866&units=metric`)
        let weatherData = await weather.json();
        weatherRender(weatherData);
    })
}

const weatherRender = async (data) => {
    let weatherContent = data.weather[0].description;
    let weatherIcon = "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
    let weatherTemp = Math.floor(data.main.temp) + " °C" 
    document.getElementById('latest-header').innerHTML += `
    <p id="weather"><img src="${weatherIcon}">${weatherContent}<span>${weatherTemp}</span></p>
    `
}

weatherApi()

// 뉴스 slider
const arrowBtns = document.querySelectorAll('#featured-btns button')
const sliderUl = document.querySelector('#slider-news ul')
const liWidth = 550;
let moveDist = 0;
let currentNum = 0;


function newsSlider(ul, featuredLength){
    sliderUl.style.width = `${ul}px`
    const leftClick = () => {
        if(currentNum === 0){
            moveDist = -(ul - liWidth);
            sliderUl.style.left = `${moveDist}px`
            currentNum = featuredLength - 1;
            console.log(moveDist)
        }else{
            moveDist += 550;
            sliderUl.style.left = `${moveDist}px`
            currentNum -= 1;
        }
    }
    const rightClick = () => {
        if(currentNum === (featuredLength - 1)){
            moveDist = 0;
            sliderUl.style.left = `${moveDist}px`
            currentNum = 0;
        }else{
            moveDist += -550;
            sliderUl.style.left = `${moveDist}px`
            currentNum += 1;
        }
    }

    arrowBtns[0].addEventListener('click', leftClick)
    arrowBtns[1].addEventListener('click', rightClick)
}



// 뉴스 api

let url;

const NewsAPI = async() => {
    
    try{

        let News = await fetch(url)
        let NewsData = await News.json();

        if(News.status == 200){

            if(NewsData.totalArticles === 0){
                throw new Error('검색된 뉴스가 없습니다.')
            }else{
                latestNewsRender(NewsData);
            }

        }else{

            throw new Error(NewsData.message)

        }

    }catch(error){
        errorRender(error.message);
    }

}

function errorRender(message){
    let errorHTML = `<div>${message}</div>`
    document.getElementById('latest-contents').innerHTML = errorHTML
}

// 최신 뉴스 가져오기

const getNewsApi = async () => {
    url = `https://gnews.io/api/v4/top-headlines?country=us&lang=en&max=4&token=02e104a4f558139f3a8d434ec2803527`
    NewsAPI();
}

// 과거 뉴스 갖고오기

const getFeaturedNews = async () => {
    let featuredNews = await fetch(`https://gnews.io/api/v4/top-headlines?country=us&lang=en&max=50&to=2022-08-21T16:27:09Z&token=02e104a4f558139f3a8d434ec2803527`)
    let featuredData = await featuredNews.json();
    console.log(featuredData)
    featuredNewsRender(featuredData);
}

const latestNewsRender = async (data) => {
    let NewsHTML = ``;
    let articles = data.articles
    if(articles.image == 'null' || articles.image == ''){
        articles.image = '../images/noImage.png'
    }
    NewsHTML += `
    <div id="main-news" class="news">
    <img src="${articles[0].image}" alt="">
    <dl>
        <dt>${articles[0].title}</dt>
        <dd id="news-cnt">${articles[0].content}</dd>
        <dd id="news-info">${moment(articles[0].publishedAt).fromNow()}</dd>
    </dl>
</div>
<div id="sub-news">
    <div id="mid-news">
        <div id="sec-news" class="news">
            <dl>
                <dt>${articles[1].title}</dt>
                <dd id="news-cnt">${articles[1].content}</dd>
                <dd id="news-info">${moment(articles[1].publishedAt).fromNow()}</dd>
            </dl>
        </div>
        <div id="thr-news" class="news">
            <img src="${articles[2].image}" alt="">
            <dl>
                <dt>${articles[2].title}</dt>
                <dd id="news-info">${moment(articles[2].publishedAt).fromNow()}</dd>
            </dl>
        </div>
    </div>
    <div id="four-news" class="news">
        <img src="${articles[3].image}" alt="">
        <dl>
            <dt>${articles[3].title}</dt>
            <dd id="news-cnt">${articles[3].content}</dd>
            <dd id="news-info">${moment(articles[3].publishedAt).fromNow()}</dd>
        </dl>
    </div>
</div>
    `
    document.getElementById('latest-contents').innerHTML = NewsHTML;
}

// 과거 뉴스 ui에 보이기

const featuredNewsRender = async(data) => {
    let featuredNewsHTML = ``;
    let featuredArticles = data.articles

    await featuredArticles.forEach((item) => {
        featuredNewsHTML += `
        <li>
            <img src="${item.image}" alt="">
            <div>
                <p>
                    ${item.title}
                    <span>${item.content}</span>
                </p>
            </div>
        </li>
        `;
        
    });

    let ul = liWidth * featuredArticles.length
    newsSlider(ul, featuredArticles.length)

    document.querySelector('#slider-news ul').innerHTML = featuredNewsHTML;
}
// category 별 뉴스 검색
const categoryTab = document.querySelectorAll('#category-menu li')

const getCategoryNews = async (event) => {
    const headerTitle = document.querySelector('#latest-header h2')
    headerTitle.innerText = `${event.target.textContent} Latest News`
    let category = event.target.textContent.toLowerCase()
    url = `https://gnews.io/api/v4/top-headlines?country=us&topic=${category}&lang=en&max=4&token=02e104a4f558139f3a8d434ec2803527`
    NewsAPI();
}

categoryTab.forEach((item) => {
    item.addEventListener('click',(event) => {getCategoryNews(event)});
})

// 키워드 별 검색 기능

const searchInput = document.getElementById('search-input')
const searchSubmit = document.getElementById('search-submit')

const searchNewsApi = async () => {
    let keyword = searchInput.value;
    document.querySelector('#latest-header h2').innerText = `${keyword} News`
    url = `https://gnews.io/api/v4/search?country=us&q=${keyword}&max=4&token=02e104a4f558139f3a8d434ec2803527`
    NewsAPI();

    searchInput.value = '';
}

searchSubmit.addEventListener('click', searchNewsApi);


getNewsApi();
getFeaturedNews();
