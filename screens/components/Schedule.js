import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

dayjs.extend(utc);
dayjs.extend(timezone);

const Schedule = ({ scheduledPosts = [], refreshPosts }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileInfo, setProfileInfo] = useState({
    name: '',
    email: '',
    profilePic: '', // URL for profile image
  });

  // Pagination state
  const [currentPageQueue, setCurrentPageQueue] = useState(1);
  const [currentPagePosted, setCurrentPagePosted] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    axios
      .get('https://yourapi.com/api/profile', { withCredentials: true })
      .then((response) => {
        setProfileInfo({
          name: response.data.name || 'User Name',
          email: response.data.email || 'user@example.com',
          profilePic: response.data.profilePic || '',
        });
      })
      .catch((err) => {
        console.error('Failed to load profile info:', err);
      });
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Logged out successfully!');
    navigation.navigate('Login');
  };

  const deleteScheduledPost = async (postId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this scheduled post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const res = await axios.post(
                'https://yourapi.com/api/scheduled-posts/delete',
                { id: postId },
                { withCredentials: true }
              );
              if (res.data.message) {
                Alert.alert('Success', res.data.message);
                if (typeof refreshPosts === 'function') {
                  refreshPosts();
                }
              } else {
                Alert.alert('Error', res.data.error || 'Error deleting scheduled post');
              }
            } catch (err) {
              Alert.alert('Error', 'Error deleting scheduled post');
            }
          },
        },
      ]
    );
  };

  const getFirstSentence = (text) => {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences[0].trim();
  };

  // Pagination helper function
  const renderPagination = (currentPage, totalPages, onPageChange) => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage, '...', totalPages];
      }
    }
    return (
      <View style={styles.paginationContainer}>
        {currentPage > 1 && (
          <TouchableOpacity onPress={() => onPageChange(currentPage - 1)} style={styles.paginationButton}>
            <Text>Previous</Text>
          </TouchableOpacity>
        )}
        {pages.map((page, index) =>
          page === '...' ? (
            <Text key={index} style={styles.paginationEllipsis}>
              ...
            </Text>
          ) : (
            <TouchableOpacity
              key={index}
              onPress={() => onPageChange(page)}
              style={[
                styles.paginationButton,
                currentPage === page && styles.activePaginationButton,
              ]}
            >
              <Text style={currentPage === page && styles.activePaginationText}>{page}</Text>
            </TouchableOpacity>
          )
        )}
        {currentPage < totalPages && (
          <TouchableOpacity onPress={() => onPageChange(currentPage + 1)} style={styles.paginationButton}>
            <Text>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQueueTab = () => {
    const pendingPosts = (scheduledPosts || []).filter((post) => post.status === 'pending');
    const totalPagesQueue = Math.ceil(pendingPosts.length / postsPerPage);
    const startIndexQueue = (currentPageQueue - 1) * postsPerPage;
    const currentQueuePosts = pendingPosts.slice(startIndexQueue, startIndexQueue + postsPerPage);

    if (loading) {
      return <Text style={styles.centerText}>Loading...</Text>;
    } else if (error) {
      return <Text style={[styles.centerText, { color: 'red' }]}>{error}</Text>;
    } else if (pendingPosts.length === 0) {
      return <Text style={[styles.centerText, { color: 'red' }]}>You have no posts scheduled</Text>;
    } else {
      return (
        <View>
          {currentQueuePosts.map((post, index) => (
            <View key={index} style={styles.postItem}>
              <View style={styles.postHeader}>
                <Text style={styles.postDate}>
                  {dayjs
                    .utc(post.scheduled_datetime)
                    .tz(dayjs.tz.guess())
                    .format('MMM D, YYYY h:mm A')}
                </Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => navigation.navigate('EditScheduledPost', { id: post.id })}>
                    <MaterialIcons name="edit" size={18} color="#0000FF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteScheduledPost(post.id)}>
                    <MaterialIcons name="delete" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.postSnippet}>{getFirstSentence(post.post_text)}</Text>
            </View>
          ))}
          {totalPagesQueue > 1 && renderPagination(currentPageQueue, totalPagesQueue, setCurrentPageQueue)}
        </View>
      );
    }
  };

  const renderPostedTab = () => {
    const publishedPosts = (scheduledPosts || []).filter((post) => post.status === 'published');
    const totalPagesPosted = Math.ceil(publishedPosts.length / postsPerPage);
    const startIndexPosted = (currentPagePosted - 1) * postsPerPage;
    const currentPostedPosts = publishedPosts.slice(startIndexPosted, startIndexPosted + postsPerPage);

    if (loading) {
      return <Text style={styles.centerText}>Loading...</Text>;
    } else if (error) {
      return <Text style={[styles.centerText, { color: 'red' }]}>{error}</Text>;
    } else if (publishedPosts.length === 0) {
      return <Text style={[styles.centerText, { color: 'red' }]}>You have no published posts</Text>;
    } else {
      return (
        <View>
          {currentPostedPosts.map((post, index) => (
            <View key={index} style={styles.postItem}>
              <View style={styles.postHeader}>
                <Text style={styles.postDate}>
                  {dayjs
                    .utc(post.scheduled_datetime)
                    .tz(dayjs.tz.guess())
                    .format('MMM D, YYYY h:mm A')}
                </Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => navigation.navigate('EditScheduledPost', { id: post.id })}>
                    <MaterialIcons name="edit" size={18} color="#0000FF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteScheduledPost(post.id)}>
                    <MaterialIcons name="delete" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.postSnippet}>{getFirstSentence(post.post_text)}</Text>
            </View>
          ))}
          {totalPagesPosted > 1 && renderPagination(currentPagePosted, totalPagesPosted, setCurrentPagePosted)}
        </View>
      );
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'queue') return renderQueueTab();
    if (activeTab === 'posted') return renderPostedTab();
  };

  return (
    <View style={styles.container}>
      {/* Profile and Tabs */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => {}} style={styles.profileRow}>
          {/* For profilePic, you may use an Image component if you have a valid URL */}
          <View style={styles.profilePicPlaceholder} />
          <Text style={styles.profileName}>{profileInfo.name || 'User Name'}</Text>
        </TouchableOpacity>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('queue')}
            style={[styles.tabButton, activeTab === 'queue' && styles.activeTab]}
          >
            <Text style={activeTab === 'queue' ? styles.activeTabText : styles.tabText}>Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('posted')}
            style={[styles.tabButton, activeTab === 'posted' && styles.activeTab]}
          >
            <Text style={activeTab === 'posted' ? styles.activeTabText : styles.tabText}>Posted</Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderTabContent()}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 8
  },
  profileContainer: {
    marginBottom: 16
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  profilePicPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 20,
    marginRight: 8
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#0000FF'
  },
  tabText: {
    color: '#666'
  },
  activeTabText: {
    color: '#0000FF',
    fontWeight: 'bold'
  },
  postItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  postDate: {
    fontSize: 12,
    color: '#333'
  },
  iconRow: {
    flexDirection: 'row'
  },
  postSnippet: {
    fontSize: 14,
    color: '#555'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8
  },
  paginationButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    borderRadius: 4
  },
  activePaginationButton: {
    backgroundColor: '#0000FF'
  },
  activePaginationText: {
    color: '#fff'
  },
  paginationEllipsis: {
    padding: 8,
    marginHorizontal: 4
  },
  logoutContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  logoutButton: {
    padding: 12,
    backgroundColor: 'red',
    borderRadius: 8
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default Schedule;

