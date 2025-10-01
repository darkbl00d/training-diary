"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const inputReset = document.querySelector(".reset-btn");
// let map;
// let mapEvents;
// let mapCords;
function eror() {
  alert("Вы не разрешили Доступ к Геопозиции");
}
// function success(position) {
//   alert("Доступ разрешён");

//   function addPopup(mapEvents) {
//     const { lat, lng } = mapCords;
//     console.log(lat, lng);
//     L.marker([lat, lng])
//       .addTo(map)
//       .bindPopup(
//         L.popup({
//           autoClose: false,
//           closeOnClick: false,
//           className: "mark-popup",
//           content: "Тренировка",
//         })
//       )
//       .openPopup();
//     console.log(lat, lng);
//   }
//   // const { latitude } = position.coords;
//   // const { longitude } = position.coords;
//   // const cords = [latitude, longitude];
//   // console.log(position);

//   // map = L.map("map").setView(cords, 15);

//   // L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   //   attribution:
//   //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   // }).addTo(map);

//   // L.marker(cords).addTo(map).bindPopup("Вы находитесь здесь").openPopup();
//   // map.on("click", function (mapE) {
//   //   console.log(mapE);
//   //   mapEvents = mapE;
//   //   mapCords = mapE.latlng;
//   //   form.classList.remove("hidden");
//   //   inputDistance.focus();
//   // });

//   form.addEventListener("submit", function (e) {
//     e.preventDefault();
//     addPopup();
//     inputDistance.value =
//       inputDuration.value =
//       inputCadence.value =
//       inputElevation.value =
//         "";
//   });

//   inputType.addEventListener("change", function (e) {
//     e.preventDefault();
//     inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
//     inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
//   });
// }

class WorkOut {
  date = new Date();
  id = (Date.now() + ``).slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDesc() {
    // prettier-ignore
    const months = ["January","February","March","April","May",
"June","July","August","September","October","November","December"];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)}
    ${months[this.date.getMonth()]}
    ${this.date.getDate()}`;
  }
}

class Running extends WorkOut {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDesc();
  }
  calcPace() {
    this.pace = (this.distance / this.duration).toFixed(1);
    return this.pace;
  }
}

class Cycling extends WorkOut {
  type = `cycling`;
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDesc();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60).toFixed(1);
    return this.speed;
  }
}
let runnner = new Running([-5, -50], 100, 60, 25);
let cycler = new Cycling([-5, -50], 100, 60, 25);

// Приложение карты
class App {
  // Массив с Тренеровками
  #workouts = [];
  // Получаем из API массив с картой
  #map;
  // Events с массива с карты
  #mapEvents;
  // Кординаты
  #mapCords;
  constructor() {
    this._getPosition();
    this._getLS();
    form.addEventListener("submit", this._newMarker.bind(this));
    inputType.addEventListener("change", this._toogleField);
    containerWorkouts.addEventListener("click", this.#swichWork.bind(this));
    inputReset.addEventListener("click", this.resetLS);
  }
  // Получаем кординаты User
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), eror);
  }
  // Прогрузка карты
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cords = [latitude, longitude];
    this.#map = L.map("map").setView(cords, 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(cords)
      .addTo(this.#map)
      .bindPopup("Вы находитесь здесь")
      .openPopup();

    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach((work) => this.#renderWorkMark(work));
  }
  // Открытие формы
  _showForm(mapE) {
    this.#mapEvents = mapE;
    this.#mapCords = mapE.latlng;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  // Переключатель бег / велоезда
  _toogleField(e) {
    e.preventDefault();
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  // Установка нового маркера
  _newMarker(mapEvents) {
    mapEvents.preventDefault();
    // Определяем тип тренеровки и получаем инф с формы
    let workout;
    const { lat, lng } = this.#mapCords;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const validateInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const plusInput = (...inputs) => inputs.every((imp) => imp > 0);
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !validateInput(distance, duration, cadence) ||
        !plusInput(distance, duration, cadence)
      ) {
        return alert("Вы ввели не корректные данные");
      }
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validateInput(distance, duration, elevation) ||
        !plusInput(distance, duration, elevation)
      ) {
        return alert("Вы ввели не корректные данные");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#renderWorkMark(workout);
    this.#renderWorkOut(workout);
    this.#workouts.push(workout);
    this.#formHidden();
    this.#setLocalStorage();
  }
  // Загрузка Маркеров
  #renderWorkMark(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: "mark-popup",
          content: `${workout.type == "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
            workout.description
          }. ${workout.distance} km`,
        })
      )
      .openPopup();
  }

  // Рендер списка тренеровок
  #renderWorkOut(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
          </div>`;

    if (workout.type == "running") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">мин/км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">шаг</span>
          </div>
        </li>`;
    }
    if (workout.type == "cycling") {
      html += `
    <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">км/час</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">м</span>
          </div>
        </li>
        `;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  // Отчистка формы, и сброс данных
  #formHidden() {
    form.classList.add("hidden");
    form.reset();
  }
  // Переход к Тренеровке
  #swichWork(e) {
    const workoutEv = e.target.closest(".workout");
    if (!workoutEv) return;
    const work = this.#workouts.find((work) => work.id == workoutEv.dataset.id);
    this.#map.setView(work.coords, 17, { animate: true, pan: { duration: 1 } });
  }
  // Сохраняем тренеровки в LS
  #setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }
  // Получаем данные с ls
  _getLS() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach((work) => this.#renderWorkOut(work));
  }
  // Сброс тренеровок
  resetLS() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const vlad = new App();
