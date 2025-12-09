import 'grpc_channel_io.dart' if (dart.library.html) 'grpc_channel_web.dart';

dynamic getGrpcChannel(String host, int port) {
  return getChannel(host, port);
}
