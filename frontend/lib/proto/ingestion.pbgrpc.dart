// This is a generated file - do not edit.
//
// Generated from ingestion.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:async' as $async;
import 'dart:core' as $core;

import 'package:grpc/service_api.dart' as $grpc;
import 'package:protobuf/protobuf.dart' as $pb;

import 'ingestion.pb.dart' as $0;

export 'ingestion.pb.dart';

@$pb.GrpcServiceName('superexam.ingestion.IngestionService')
class IngestionServiceClient extends $grpc.Client {
  /// The hostname for this service.
  static const $core.String defaultHost = '';

  /// OAuth scopes needed for the client.
  static const $core.List<$core.String> oauthScopes = [
    '',
  ];

  IngestionServiceClient(super.channel, {super.options, super.interceptors});

  /// Uploads a PDF file (as a single message) and receives a stream of status updates.
  /// Changed from bidirectional streaming to support gRPC-Web.
  $grpc.ResponseStream<$0.IngestionStatus> uploadPdf(
    $0.UploadRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createStreamingCall(
        _$uploadPdf, $async.Stream.fromIterable([request]),
        options: options);
  }

  /// Lists all uploaded documents and their current status.
  $grpc.ResponseFuture<$0.ListDocumentsResponse> listDocuments(
    $0.ListDocumentsRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$listDocuments, request, options: options);
  }

  /// Triggers processing (extraction) for an existing document.
  $grpc.ResponseStream<$0.IngestionStatus> processDocument(
    $0.ProcessRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createStreamingCall(
        _$processDocument, $async.Stream.fromIterable([request]),
        options: options);
  }

  // method descriptors

  static final _$uploadPdf =
      $grpc.ClientMethod<$0.UploadRequest, $0.IngestionStatus>(
          '/superexam.ingestion.IngestionService/UploadPdf',
          ($0.UploadRequest value) => value.writeToBuffer(),
          $0.IngestionStatus.fromBuffer);
  static final _$listDocuments =
      $grpc.ClientMethod<$0.ListDocumentsRequest, $0.ListDocumentsResponse>(
          '/superexam.ingestion.IngestionService/ListDocuments',
          ($0.ListDocumentsRequest value) => value.writeToBuffer(),
          $0.ListDocumentsResponse.fromBuffer);
  static final _$processDocument =
      $grpc.ClientMethod<$0.ProcessRequest, $0.IngestionStatus>(
          '/superexam.ingestion.IngestionService/ProcessDocument',
          ($0.ProcessRequest value) => value.writeToBuffer(),
          $0.IngestionStatus.fromBuffer);
}

@$pb.GrpcServiceName('superexam.ingestion.IngestionService')
abstract class IngestionServiceBase extends $grpc.Service {
  $core.String get $name => 'superexam.ingestion.IngestionService';

  IngestionServiceBase() {
    $addMethod($grpc.ServiceMethod<$0.UploadRequest, $0.IngestionStatus>(
        'UploadPdf',
        uploadPdf_Pre,
        false,
        true,
        ($core.List<$core.int> value) => $0.UploadRequest.fromBuffer(value),
        ($0.IngestionStatus value) => value.writeToBuffer()));
    $addMethod(
        $grpc.ServiceMethod<$0.ListDocumentsRequest, $0.ListDocumentsResponse>(
            'ListDocuments',
            listDocuments_Pre,
            false,
            false,
            ($core.List<$core.int> value) =>
                $0.ListDocumentsRequest.fromBuffer(value),
            ($0.ListDocumentsResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.ProcessRequest, $0.IngestionStatus>(
        'ProcessDocument',
        processDocument_Pre,
        false,
        true,
        ($core.List<$core.int> value) => $0.ProcessRequest.fromBuffer(value),
        ($0.IngestionStatus value) => value.writeToBuffer()));
  }

  $async.Stream<$0.IngestionStatus> uploadPdf_Pre($grpc.ServiceCall $call,
      $async.Future<$0.UploadRequest> $request) async* {
    yield* uploadPdf($call, await $request);
  }

  $async.Stream<$0.IngestionStatus> uploadPdf(
      $grpc.ServiceCall call, $0.UploadRequest request);

  $async.Future<$0.ListDocumentsResponse> listDocuments_Pre(
      $grpc.ServiceCall $call,
      $async.Future<$0.ListDocumentsRequest> $request) async {
    return listDocuments($call, await $request);
  }

  $async.Future<$0.ListDocumentsResponse> listDocuments(
      $grpc.ServiceCall call, $0.ListDocumentsRequest request);

  $async.Stream<$0.IngestionStatus> processDocument_Pre($grpc.ServiceCall $call,
      $async.Future<$0.ProcessRequest> $request) async* {
    yield* processDocument($call, await $request);
  }

  $async.Stream<$0.IngestionStatus> processDocument(
      $grpc.ServiceCall call, $0.ProcessRequest request);
}
