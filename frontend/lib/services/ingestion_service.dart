import 'dart:async';
import 'package:grpc/grpc.dart';
import 'package:frontend/proto/ingestion.pbgrpc.dart';
import 'package:frontend/services/grpc_channel.dart';
import 'dart:typed_data';

class IngestionService {
  late IngestionServiceClient _stub;
  dynamic _channel;

  IngestionService() {
    _channel = getGrpcChannel('localhost', 50051);
    _stub = IngestionServiceClient(_channel!);
  }

  Stream<IngestionStatus> uploadPdf(String filename, Uint8List data, String userPrompt) async* {
    final metadata = FileMetadata()
      ..filename = filename
      ..contentType = 'application/pdf'
      ..userPrompt = userPrompt;

    // Send a single request with both metadata and file data
    final request = UploadRequest()
      ..metadata = metadata
      ..fileData = data;

    // Call the RPC with the single request object
    final responseStream = _stub.uploadPdf(request);

    await for (var status in responseStream) {
      yield status;
    }
  }

  Future<void> shutdown() async {
    await _channel?.shutdown();
  }
}
