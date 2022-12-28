import 'package:dio/dio.dart';

const base = 'http://localhost:3000';

int calculate() {
  return 6 * 7;
}

void createBotUsers() async {
  var dio = Dio();

  for (var i = 7; i < 100; i++) {
    await dio.post(
      '$base/api/auth/signup',
      data: {
        "username": "$i",
        "password": "123",
        "firstName": "bot$i",
        "lastName": "$i",
        "mail": "$i@datingapp.com",
      },
    );
  }
}
