import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Login
function TelaLogin({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = async () => {
    if (usuario === 'daniela' && senha === 'baixinhos') {
      await AsyncStorage.setItem('usuario', 'admin');
      navigation.navigate('Inicio');
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  return (
    <View style={estilos.container}>
      <TextInput
        style={estilos.input}
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={estilos.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <Button title="Entrar" onPress={fazerLogin} />
    </View>
  );
}

//Tela Principal
function TelaInicio({ navigation }) {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const carregarProdutos = async () => {
      const produtosSalvos = await AsyncStorage.getItem('produtos');
      if (produtosSalvos) {
        setProdutos(JSON.parse(produtosSalvos));
      }
    };
    carregarProdutos();
  }, []);

  const removerProduto = async (id) => {
    const produtosAtualizados = produtos.filter(produto => produto.id !== id);
    setProdutos(produtosAtualizados);
    await AsyncStorage.setItem('produtos', JSON.stringify(produtosAtualizados));
  };

  return (
    <View style={estilos.container}>
      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={estilos.produto}>
            <Text>Produto: {item.nome}</Text>
            <Text>Quantidade: {item.quantidade} unidades</Text>
            <Button title="Vender" onPress={() => navigation.navigate('VenderProduto', { id: item.id })} />
            <Button title="Editar" onPress={() => navigation.navigate('EditarProduto', { id: item.id })} />
            <Button title="Excluir" onPress={() => removerProduto(item.id)} />
          </View>
        )}
      />
      <Button title="Adicionar Produto" onPress={() => navigation.navigate('AdicionarProduto')} />
      <Button title="Histórico de Vendas" onPress={() => navigation.navigate('HistoricoVendas')} />
    </View>
  );
}

//Adicionar Produto
function TelaAdicionarProduto({ navigation }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const adicionarProduto = async () => {
    const novoProduto = { id: String(Date.now()), nome, quantidade: parseInt(quantidade) };
    const produtosSalvos = await AsyncStorage.getItem('produtos');
    const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
    produtos.push(novoProduto);
    await AsyncStorage.setItem('produtos', JSON.stringify(produtos));
    navigation.goBack();
  };

  return (
    <View style={estilos.container}>
      <TextInput
        style={estilos.input}
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={estilos.input}
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />
      <Button title="Adicionar" onPress={adicionarProduto} />
    </View>
  );
}

//Editar Produto
function TelaEditarProduto({ route, navigation }) {
  const { id } = route.params;
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');

  useEffect(() => {
    const carregarProduto = async () => {
      const produtosSalvos = await AsyncStorage.getItem('produtos');
      const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
      const produto = produtos.find(p => p.id === id);
      if (produto) {
        setNome(produto.nome);
        setQuantidade(produto.quantidade.toString());
      }
    };
    carregarProduto();
  }, [id]);

  const salvarAlteracoes = async () => {
    const produtosSalvos = await AsyncStorage.getItem('produtos');
    const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
    const produtosAtualizados = produtos.map(p => p.id === id ? { ...p, nome, quantidade: parseInt(quantidade) } : p);
    await AsyncStorage.setItem('produtos', JSON.stringify(produtosAtualizados));
    navigation.goBack();
  };

  return (
    <View style={estilos.container}>
      <TextInput
        style={estilos.input}
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={estilos.input}
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />
      <Button title="Salvar" onPress={salvarAlteracoes} />
    </View>
  );
}

//Registrar Venda
function TelaVenderProduto({ route, navigation }) {
  const { id } = route.params;
  const [quantidadeVendida, setQuantidadeVendida] = useState('');
  const [produto, setProduto] = useState(null);

  useEffect(() => {
    const carregarProduto = async () => {
      const produtosSalvos = await AsyncStorage.getItem('produtos');
      const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
      const produtoSelecionado = produtos.find(p => p.id === id);
      setProduto(produtoSelecionado);
    };
    carregarProduto();
  }, [id]);

  const registrarVenda = async () => {
    const produtosSalvos = await AsyncStorage.getItem('produtos');
    const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
    const produtosAtualizados = produtos.map(p =>
      p.id === id ? { ...p, quantidade: p.quantidade - parseInt(quantidadeVendida) } : p
    );
    await AsyncStorage.setItem('produtos', JSON.stringify(produtosAtualizados));

    // Registrar no histórico de vendas
    const novaVenda = { id: String(Date.now()), nomeProduto: produto.nome, quantidade: parseInt(quantidadeVendida), data: new Date() };
    const vendasSalvas = await AsyncStorage.getItem('vendas');
    const vendas = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    vendas.push(novaVenda);
    await AsyncStorage.setItem('vendas', JSON.stringify(vendas));

    navigation.goBack();
  };

  return (
    <View style={estilos.container}>
      {produto && (
        <>
          <Text>Produto: {produto.nome}</Text>
          <Text>Quantidade em Estoque: {produto.quantidade}</Text>
          <TextInput
            style={estilos.input}
            placeholder="Quantidade a Vender"
            keyboardType="numeric"
            value={quantidadeVendida}
            onChangeText={setQuantidadeVendida}
          />
          <Button title="Registrar Venda" onPress={registrarVenda} />
        </>
      )}
    </View>
  );
}

// Tela para Mostrar Histórico de Vendas
function TelaHistoricoVendas() {
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    const carregarVendas = async () => {
      const vendasSalvas = await AsyncStorage.getItem('vendas');
      if (vendasSalvas) {
        setVendas(JSON.parse(vendasSalvas));
      }
    };
    carregarVendas();
  }, []);

  return (
    <View style={estilos.container}>
      <FlatList
        data={vendas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={estilos.produto}>
            <Text>Produto: {item.nomeProduto}</Text>
            <Text>Quantidade Vendida: {item.quantidade}</Text>
            <Text>Data: {new Date(item.data).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Inicio" component={TelaInicio} />
        <Stack.Screen name="AdicionarProduto" component={TelaAdicionarProduto} />
        <Stack.Screen name="EditarProduto" component={TelaEditarProduto} />
         <Stack.Screen name="VenderProduto" component={TelaVenderProduto} />
        <Stack.Screen name="HistoricoVendas" component={TelaHistoricoVendas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  produto: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#6a1e75',
    borderRadius: 5,
    backgroundColor: 'pink',
  },
});