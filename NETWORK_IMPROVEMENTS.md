# Network Resilience Improvements

## Quick Wins:

1. **Retry Logic**: Add automatic retry for failed API calls
2. **Network Status**: Show "No Internet" message when offline
3. **Cached Fallbacks**: Cache last successful movie data for offline play

## Implementation:

```javascript
// Add to RandomMoviesScreen.jsx
import NetInfo from '@react-native-community/netinfo';

const [isConnected, setIsConnected] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setIsConnected(state.isConnected);
  });
  return unsubscribe;
}, []);
```

## Priority: Medium (nice-to-have for v1.0)
