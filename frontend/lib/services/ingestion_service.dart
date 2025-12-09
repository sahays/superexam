import 'dart:async';
import 'package:grpc/grpc.dart';
import 'package:frontend/proto/ingestion.pbgrpc.dart';
import 'dart:typed_data';

class IngestionService {
  late IngestionServiceClient _stub;
  ClientChannel? _channel;

  IngestionService() {
    _channel = ClientChannel(
      'localhost',
      port: 50051,
      options: const ChannelOptions(credentials: ChannelCredentials.insecure()),
    );
    _stub = IngestionServiceClient(_channel!);
  }

  Stream<IngestionStatus> uploadPdf(String filename, Uint8List data, String userPrompt) async* {
    final metadata = FileMetadata()
      ..filename = filename
      ..contentType = 'application/pdf'
      ..userPrompt = userPrompt;

    // Create a stream of requests
    // First, send metadata
    final metadataReq = UploadRequest()..metadata = metadata;
    
    // Then chunks (simplification: sending one big chunk for now, usually we split)
    final chunkReq = UploadRequest()..chunk = data;

    final requestStream = Stream.fromIterable([metadataReq, chunkReq]);

    final responseStream = _stub.uploadPdf(requestStream);

    await for (var status in responseStream) {
      yield status;
    }
  }

  Future<void> shutdown() async {
    await _channel?.shutdown();
  }
}
