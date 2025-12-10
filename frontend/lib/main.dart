import 'package:flutter/material.dart';
import 'package:frontend/ui/screens/ingestion_screen.dart';
import 'package:frontend/ui/layout/admin_shell.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SuperExam',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3B82F6)),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const AdminShell(
        title: 'Exam Ingestion',
        child: IngestionScreen(),
      ),
    );
  }
}

