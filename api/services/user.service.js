
async function getUsers(req,res) {
    // richiesta al DB
    const users = [
        { id: 1, name: 'Mario Rossi' },
        { id: 2, name: 'Luigi Verdi' }
      ];
    res.json(users);
    
}


module.exports = {getUsers} 