// This is a generated file - do not edit.
//
// Generated from history.proto.

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

import 'history.pb.dart' as $0;

export 'history.pb.dart';

@$pb.GrpcServiceName('superexam.history.HistoryService')
class HistoryServiceClient extends $grpc.Client {
  /// The hostname for this service.
  static const $core.String defaultHost = '';

  /// OAuth scopes needed for the client.
  static const $core.List<$core.String> oauthScopes = [
    '',
  ];

  HistoryServiceClient(super.channel, {super.options, super.interceptors});

  $grpc.ResponseFuture<$0.ExamList> listExams(
    $0.ListExamsRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$listExams, request, options: options);
  }

  $grpc.ResponseFuture<$0.ExamDetails> getExamDetails(
    $0.GetExamDetailsRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$getExamDetails, request, options: options);
  }

  // method descriptors

  static final _$listExams =
      $grpc.ClientMethod<$0.ListExamsRequest, $0.ExamList>(
          '/superexam.history.HistoryService/ListExams',
          ($0.ListExamsRequest value) => value.writeToBuffer(),
          $0.ExamList.fromBuffer);
  static final _$getExamDetails =
      $grpc.ClientMethod<$0.GetExamDetailsRequest, $0.ExamDetails>(
          '/superexam.history.HistoryService/GetExamDetails',
          ($0.GetExamDetailsRequest value) => value.writeToBuffer(),
          $0.ExamDetails.fromBuffer);
}

@$pb.GrpcServiceName('superexam.history.HistoryService')
abstract class HistoryServiceBase extends $grpc.Service {
  $core.String get $name => 'superexam.history.HistoryService';

  HistoryServiceBase() {
    $addMethod($grpc.ServiceMethod<$0.ListExamsRequest, $0.ExamList>(
        'ListExams',
        listExams_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.ListExamsRequest.fromBuffer(value),
        ($0.ExamList value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.GetExamDetailsRequest, $0.ExamDetails>(
        'GetExamDetails',
        getExamDetails_Pre,
        false,
        false,
        ($core.List<$core.int> value) =>
            $0.GetExamDetailsRequest.fromBuffer(value),
        ($0.ExamDetails value) => value.writeToBuffer()));
  }

  $async.Future<$0.ExamList> listExams_Pre($grpc.ServiceCall $call,
      $async.Future<$0.ListExamsRequest> $request) async {
    return listExams($call, await $request);
  }

  $async.Future<$0.ExamList> listExams(
      $grpc.ServiceCall call, $0.ListExamsRequest request);

  $async.Future<$0.ExamDetails> getExamDetails_Pre($grpc.ServiceCall $call,
      $async.Future<$0.GetExamDetailsRequest> $request) async {
    return getExamDetails($call, await $request);
  }

  $async.Future<$0.ExamDetails> getExamDetails(
      $grpc.ServiceCall call, $0.GetExamDetailsRequest request);
}
