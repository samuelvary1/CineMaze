import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

const PathMapModal = ({ visible, onClose, leftPath, rightPath, movieA, movieB }) => {
  const renderPathColumn = (path, color, label) => {
    if (!path || path.length <= 1) {
      return (
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color }]}>{label}</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No moves yet</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.column}>
        <Text style={[styles.columnLabel, { color }]}>{label}</Text>
        {path.map((node, index) => {
          const isFirst = index === 0;
          const isLast = index === path.length - 1;
          const icon = node.type === 'movie' ? '🎬' : '🎭';
          const name = node.data.title || node.data.name;

          return (
            <View key={`${label}-${index}`} style={styles.stepRow}>
              {/* Timeline line + dot */}
              <View style={styles.timeline}>
                {!isFirst && <View style={[styles.lineSegment, { backgroundColor: color }]} />}
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isLast ? color : '#FFFFFF', borderColor: color },
                  ]}
                />
                {!isLast && <View style={[styles.lineSegment, { backgroundColor: color }]} />}
              </View>

              {/* Label */}
              <View style={[styles.stepLabel, isLast && styles.stepLabelCurrent]}>
                <Text style={styles.stepIcon}>{icon}</Text>
                <Text
                  style={[styles.stepText, isLast && { fontWeight: '700', color }]}
                  numberOfLines={2}
                >
                  {name}
                </Text>
                {isFirst && <Text style={styles.stepBadge}>START</Text>}
                {isLast && index > 0 && (
                  <Text style={[styles.stepBadge, { backgroundColor: color }]}>NOW</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const leftMoves = Math.max(0, leftPath.length - 1);
  const rightMoves = Math.max(0, rightPath.length - 1);
  const totalMoves = leftMoves + rightMoves;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🗺️ Connection Map</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Goal bar */}
          <View style={styles.goalBar}>
            <Text style={styles.goalText} numberOfLines={1}>
              🎬 {movieA.title}
            </Text>
            <Text style={styles.goalArrow}>↔</Text>
            <Text style={styles.goalText} numberOfLines={1}>
              🎬 {movieB.title}
            </Text>
          </View>

          <Text style={styles.moveCount}>
            {totalMoves} move{totalMoves !== 1 ? 's' : ''} so far
          </Text>

          {/* Two-column path map */}
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.columns}>
              {renderPathColumn(leftPath, '#3498DB', 'Left')}
              <View style={styles.divider} />
              {renderPathColumn(rightPath, '#E67E22', 'Right')}
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F8C8D',
  },
  goalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  goalArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BDC3C7',
    marginHorizontal: 6,
  },
  moveCount: {
    textAlign: 'center',
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 14,
  },
  scrollArea: {
    maxHeight: 400,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
    alignSelf: 'stretch',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 48,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
  },
  lineSegment: {
    flex: 1,
    width: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stepLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  stepLabelCurrent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  stepIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  stepBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#BDC3C7',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    color: '#BDC3C7',
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PathMapModal;
