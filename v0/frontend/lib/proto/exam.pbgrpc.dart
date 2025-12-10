// This is a generated file - do not edit.
//
// Generated from exam.proto.

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

import 'exam.pb.dart' as $0;

export 'exam.pb.dart';

@$pb.GrpcServiceName('superexam.exam.ExamService')
class ExamServiceClient extends $grpc.Client {
  /// The hostname for this service.
  static const $core.String defaultHost = '';

  /// OAuth scopes needed for the client.
  static const $core.List<$core.String> oauthScopes = [
    '',
  ];

  ExamServiceClient(super.channel, {super.options, super.interceptors});

  $grpc.ResponseFuture<$0.CountResponse> getAvailableQuestionCount(
    $0.Empty request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$getAvailableQuestionCount, request,
        options: options);
  }

  $grpc.ResponseFuture<$0.ExamSession> createExam(
    $0.CreateExamRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$createExam, request, options: options);
  }

  $grpc.ResponseFuture<$0.ExamResult> submitExam(
    $0.ExamSubmission request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$submitExam, request, options: options);
  }

  // method descriptors

  static final _$getAvailableQuestionCount =
      $grpc.ClientMethod<$0.Empty, $0.CountResponse>(
          '/superexam.exam.ExamService/GetAvailableQuestionCount',
          ($0.Empty value) => value.writeToBuffer(),
          $0.CountResponse.fromBuffer);
  static final _$createExam =
      $grpc.ClientMethod<$0.CreateExamRequest, $0.ExamSession>(
          '/superexam.exam.ExamService/CreateExam',
          ($0.CreateExamRequest value) => value.writeToBuffer(),
          $0.ExamSession.fromBuffer);
  static final _$submitExam =
      $grpc.ClientMethod<$0.ExamSubmission, $0.ExamResult>(
          '/superexam.exam.ExamService/SubmitExam',
          ($0.ExamSubmission value) => value.writeToBuffer(),
          $0.ExamResult.fromBuffer);
}

@$pb.GrpcServiceName('superexam.exam.ExamService')
abstract class ExamServiceBase extends $grpc.Service {
  $core.String get $name => 'superexam.exam.ExamService';

  ExamServiceBase() {
    $addMethod($grpc.ServiceMethod<$0.Empty, $0.CountResponse>(
        'GetAvailableQuestionCount',
        getAvailableQuestionCount_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.Empty.fromBuffer(value),
        ($0.CountResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.CreateExamRequest, $0.ExamSession>(
        'CreateExam',
        createExam_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.CreateExamRequest.fromBuffer(value),
        ($0.ExamSession value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.ExamSubmission, $0.ExamResult>(
        'SubmitExam',
        submitExam_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.ExamSubmission.fromBuffer(value),
        ($0.ExamResult value) => value.writeToBuffer()));
  }

  $async.Future<$0.CountResponse> getAvailableQuestionCount_Pre(
      $grpc.ServiceCall $call, $async.Future<$0.Empty> $request) async {
    return getAvailableQuestionCount($call, await $request);
  }

  $async.Future<$0.CountResponse> getAvailableQuestionCount(
      $grpc.ServiceCall call, $0.Empty request);

  $async.Future<$0.ExamSession> createExam_Pre($grpc.ServiceCall $call,
      $async.Future<$0.CreateExamRequest> $request) async {
    return createExam($call, await $request);
  }

  $async.Future<$0.ExamSession> createExam(
      $grpc.ServiceCall call, $0.CreateExamRequest request);

  $async.Future<$0.ExamResult> submitExam_Pre($grpc.ServiceCall $call,
      $async.Future<$0.ExamSubmission> $request) async {
    return submitExam($call, await $request);
  }

  $async.Future<$0.ExamResult> submitExam(
      $grpc.ServiceCall call, $0.ExamSubmission request);
}
