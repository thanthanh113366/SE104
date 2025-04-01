const { db } = require('../firebase.config');

const usersCollection = db.collection('users');

// Helper functions for User collection
const User = {
  // Find a user by firebaseUid
  findOne: async (filter) => {
    try {
      let query = usersCollection;
      
      if (filter.firebaseUid) {
        const snapshot = await query.where('firebaseUid', '==', filter.firebaseUid).get();
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        return { 
          _id: doc.id, 
          ...doc.data() 
        };
      }
      
      if (filter.email) {
        const snapshot = await query.where('email', '==', filter.email).get();
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        return { 
          _id: doc.id, 
          ...doc.data() 
        };
      }
      
      if (filter._id) {
        const docRef = await usersCollection.doc(filter._id);
        const doc = await docRef.get();
        if (!doc.exists) {
          return null;
        }
        return { 
          _id: doc.id, 
          ...doc.data() 
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  },
  
  // Find a user by ID
  findById: async (id) => {
    try {
      const docRef = usersCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      return { 
        _id: doc.id, 
        ...doc.data() 
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },
  
  // Find a user by ID and update
  findByIdAndUpdate: async (id, updateData, options) => {
    try {
      const docRef = usersCollection.doc(id);
      await docRef.update({
        ...updateData,
        updatedAt: new Date()
      });
      
      if (options && options.new) {
        const updatedDoc = await docRef.get();
        return { 
          _id: updatedDoc.id, 
          ...updatedDoc.data() 
        };
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  // Create a new user document in Firestore
  create: async (userData) => {
    try {
      // Add default timestamps
      const newUser = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await usersCollection.add(newUser);
      return {
        _id: docRef.id,
        ...newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};

module.exports = User; 