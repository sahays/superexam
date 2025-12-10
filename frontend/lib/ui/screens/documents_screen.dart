import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/services/ingestion_service.dart';
import 'package:frontend/proto/ingestion.pb.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final _ingestionService = IngestionService();
  List<Document> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    try {
      final docs = await _ingestionService.listDocuments();
      setState(() {
        _documents = docs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load documents: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final brightness = MediaQuery.of(context).platformBrightness;
    final isDark = brightness == Brightness.dark;

    final cardDark = const Color(0xFF151725);
    final textPrimaryDark = const Color(0xFFFFFFFF);
    final textSecondaryDark = const Color(0xFF9CA3AF);
    
    final cardLight = const Color(0xFFFFFFFF);
    final textPrimaryLight = const Color(0xFF1F2937);
    final textSecondaryLight = const Color(0xFF64748B);

    final cardColor = isDark ? cardDark : cardLight;
    final textPrimary = isDark ? textPrimaryDark : textPrimaryLight;
    final textSecondary = isDark ? textSecondaryDark : textSecondaryLight;

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 900),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Documents',
                   style: GoogleFonts.plusJakartaSans(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: textPrimary,
                          letterSpacing: -0.5,
                   ),
                ),
                IconButton(
                  icon: Icon(Icons.refresh, color: textPrimary),
                  onPressed: _loadDocuments,
                )
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _documents.isEmpty
                      ? Center(child: Text("No documents found.", style: TextStyle(color: textSecondary)))
                      : ListView.builder(
                          itemCount: _documents.length,
                          itemBuilder: (context, index) {
                            final doc = _documents[index];
                            return Card(
                              color: cardColor,
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: Icon(Icons.description, color: textSecondary),
                                title: Text(doc.filename, style: TextStyle(color: textPrimary, fontWeight: FontWeight.w600)),
                                subtitle: Text(
                                  "Status: ${doc.status}\nCreated: ${doc.createdAt}", 
                                  style: TextStyle(color: textSecondary)
                                ),
                                isThreeLine: true,
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
