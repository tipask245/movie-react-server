# Список фильмов с возможностью написать рецензию (разрабатывается).
Сделана простая JWT авторизация, база данных postgreSQL, для получения информации о фильмах было написано 3 парсера для кинопоиска. В данный момент проект в стадии доработки.

Перед запуском сервера нужно установить postgresql и восстановить базу данных из дампа с именем movies.dump

## Инструкция по восстановлению бд
После установки postresql на компьютер нужно открыть папку, в которую субд установилась, дойти до директории 'bin', в левом верхнем углу проводника нажать на кнопку 'Файл' и выбрать 'запустить Windows PowerShell от имени администратора'.

Далее нужно подключиться к субд с помощью этой команды и написать пароль, указанный при установке postgres.  
`./psql -U postgres`

Далее с помощью запроса нужно создать пустую базу данных.  
`create database movie_react;`

Потом нужно выйти из подключения комбинацией Ctrl + C и ввести эту команду, указав путь к дампу  
`./pg_restore -v --no-owner --host=localhost --port=5432 --username=postgres --dbname=movie_react <movies.dump (если дамп лежит в папке bin) | путь к дампу>`

После проделанных действий можно проверить успешность восстановления.  
`./psql -U postgres`  
`\connect movie_react`  
`select * from users;`  

После последнего запроса субд должна вернуть таблицу с одним кортежем.


## Запуск сервера
### `npm i`
для установки зависимостей
### `npm run dev`
для запуска сервера в режиме разработки

Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

## Аккаунт тестового юзера с правами администратора 
#### login: tipask
#### password: 1234


